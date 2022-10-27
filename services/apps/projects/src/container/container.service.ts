import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import * as AdmZip from 'adm-zip';
import {randomBytes} from 'crypto';
import * as Dockerode from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';
import {firstValueFrom} from 'rxjs';
import {setTimeout} from 'timers/promises';
import {environment} from '../environment';
import {ContainerDto} from './container.dto';


@Injectable()
export class ContainerService {

  constructor(private readonly httpService: HttpService) {
  }

  private codeWorkspace: string = '/home/coder/project';

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.checkAllHeartbeats();
  }

  docker = new Dockerode({
    host: environment.docker.host,
    port: environment.docker.port,
    socketPath: environment.docker.socket,
    version: environment.docker.version,
  });


  async create(projectId: string, image?: string): Promise<ContainerDto> {
    return await this.findOne(projectId) ?? await this.start(projectId, image);
  }

  async start(projectId: string, image?: string): Promise<ContainerDto> {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const token = randomBytes(10).toString('base64');

    /* create 'settings.json' files if they don't exist already
    code server will write the user/machine settings there
    if we won't create the file manually, docker will automatically
    create a directory instead when binding it. This will
    lead to an error when code server is trying to write on the bind mount
     */

    const userSettingsFile = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/settings.json`;
    const machineSettingsFile = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/Machine/settings.json`;
    await this.createFile(userSettingsFile);
    await this.createFile(machineSettingsFile);


    const container = await this.docker.createContainer({
      Image: image || environment.docker.containerImage,
      Tty: true,
      NetworkingConfig: {
        EndpointsConfig: {
          [environment.docker.network]: {},
        },
      },
      HostConfig: {
        AutoRemove: true,
        Binds: [
          //workspace bind
          `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}:${this.codeWorkspace}`,

          // vs code User settings bind
          `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/settings.json:/home/coder/.local/share/code-server/User/settings.json`,

          //vs code Machine settings bind
          `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/Machine/settings.json:/home/coder/.local/share/code-server/Machine/settings.json`,
        ],
      },
      Env: [
        `PROJECT_ID=${projectId}`,
        `PASSWORD=${token}`,
      ],
      Labels: {
        'org.fulib.project': projectId,
        'org.fulib.token': token,
      },
    });

    await container.start();

    /*
    when using the 'codercom/code-server:latest' Image, the settings bind mount breaks the permissions
    on '/home/coder/.local'. It is owned by root (but should be owned by 'coder' user).
    So nobody (except root) can write there, which will lead to errors when for example trying to install extensions.
    So we'll change the ownership back to 'coder' to prevent that
     */
    //await this.containerExec(container,['sudo', 'chown', '-R', 'coder:coder', '/home/coder']);

    // loop over extensions list and install all extensions
    this.installExtensions(container, projectId);

    const containerDto = this.toContainer(container.id, token, projectId);
    const containerURL = containerDto.url;
    let retries = 0;
    while (!(await this.isContainerReady(containerURL)) && (retries <= 10)) {
      //wait 400ms and try again
      await setTimeout(400);
      retries++;
      if (retries >= 11) {
        console.log('timeout: couldn\'t reach vs code UI after 4 seconds. Maybe try a reload.');
      }
    }
    // write vnc url in a file (the vnc extension will read the file)
    // maybe there is a more elegant way for passing the vnc url into the extension ?
    const p: string = `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}/.vnc/vncUrl`;
    await this.createFile(p);
    await fs.promises.writeFile(p, containerDto.vncUrl);


    const buildGradlePath = `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}/build.gradle`;
    await fs.promises.readFile(buildGradlePath).catch(() => {
      //catch will trigger only if file doesn't exist, this means we have to run the /setup
      containerDto.isNew = true;
    });

    return containerDto;
  }

  async findOne(projectId: string): Promise<ContainerDto | null> {
    const containers = await this.docker.listContainers({
      all: 1,
      limit: 1,
      filters: {
        status: ['created', 'running'],
        label: [`org.fulib.project=${projectId}`],
      },
    });
    if (containers.length === 0) {
      return null;
    }
    return this.toContainer(containers[0].Id, projectId, containers[0].Labels['org.fulib.token']);
  }

  async remove(projectId: string): Promise<ContainerDto | null> {
    const existing = await this.findOne(projectId);
    if (!existing) {
      return null;
    }
    const container = this.docker.getContainer(existing.id);

    // get extensions and write in list, before stopping the container
    const stream = await this.containerExec(container, ['code-server', '--list-extensions']);
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const extensionsList = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/extensions.txt`;
    const writeStream = fs.createWriteStream(extensionsList);
    stream.pipe(writeStream);

    await container.stop();
    return existing;
  }


  private toContainer(id: string, projectId: string, token: string): ContainerDto {
    return {
      id,
      projectId,
      token,
      url: this.containerUrl(id),
      vncUrl: this.vncURL(id),
      isNew: false,
    };
  }

  private containerUrl(id: string): string {
    // define workspace through folder query parameter /?folder=...
    return `${environment.docker.proxyHost}/containers/${id.substring(0, 12)}/?folder=${this.codeWorkspace}`;
  }

  private idBin(projectId: string) {
    return projectId.slice(-2); // last 2 hex chars
  }

  private async checkAllHeartbeats() {
    const containers = await this.docker.listContainers({
      filters: {
        label: [`org.fulib.project`],
        status: ['created', 'running'],
      },
    });

    // loop over all containers, get ProjectId, check heartbeat and remove if needed
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      const projectId = container['Labels']['org.fulib.project'];

      this.isHeartbeatExpired(container.Id).then(expired => {
        expired && this.remove(projectId);
      });
    }

  }

  private async isHeartbeatExpired(containerId: string): Promise<boolean> {
    const url = `${environment.docker.proxyHost}/containers/${containerId.substring(0, 12)}`;

    try {
      const res = await firstValueFrom(this.httpService.get(`${url}/healthz`));
      // res.data.lastHeartbeat is 0, when container has just started
      return (res.data.status === 'expired' && res.data.lastHeartbeat);
    } catch (e) {
      //container is in creating phase right now, /healthz endpoint isn't ready yet
      return false;
    }
  }

  //executes command in container and returns the output stream
  private async containerExec(container: Dockerode.Container, command: string[]) {

    const exec = await container.exec({
      Cmd: command,
      AttachStderr: true,
      AttachStdout: true,
      AttachStdin: true,
      Tty: true,
    });

    const stream = await exec.start({stdin: true});
    //output on console
    //stream.pipe(process.stdout);
    //container.modem.demuxStream(stream, process.stdout, process.stderr);
    //stream.on('end', ()=> {});
    await this.streamOnEndWorkaround(exec, stream);
    return stream;
  }


  /* https://github.com/apocas/dockerode/issues/534
  stream.on("end", resolve)
  workaround */
  private streamOnEndWorkaround(exec: Dockerode.Exec, stream: any): Promise<void> {
    return new Promise<void>((resolve) => {
      // stream.on("end", resolve)
      // workaround
      const timer = setInterval(async () => {
        const r = await exec.inspect();
        if (!r.Running) {
          clearInterval(timer);
          stream.destroy();
          resolve();
        }
      }, 1e3);
    });
  }


  private async installExtensions(container: Dockerode.Container, projectId: string) {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const extensionsListPath = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/extensions.txt`;

    const fileBuffer = await fs.promises.readFile(extensionsListPath).catch(async () => {
      //create extensions.txt if not exists
      await fs.promises.writeFile(extensionsListPath, '');
    });

    if (fileBuffer) {
      const fileText = fileBuffer.toString('utf-8');
      const array = fileText.split(/\r?\n/);
      for (let i = 0; i < array.length; ++i) {
        array[i] = array[i].replace(/[^\w\d\s\\.\-]/g, '');
        array[i] = array[i].trim();
      }
      // filter array for empty or undefined values
      const cleanArr = array.filter(Boolean);
      for (let i = 0; i < cleanArr.length; ++i) {
        //install
        const stream = await this.containerExec(container, ['code-server', '--install-extension', cleanArr[i]]);
        //output to console
        stream.pipe(process.stdout);
      }
    }
  }

  /* creates file with given path only when the file doesn't exist */
  private async createFile(p: string) {
    await fs.promises.readFile(p).catch(async () => {
      await fs.promises.mkdir(path.dirname(p), {recursive: true});
      await fs.promises.writeFile(p, '');
    });
  }

  private async isContainerReady(containerURL: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.httpService.get(containerURL));
      return res.status == 200;
    } catch (e) {
      // 502 Bad Gateway
      return false;
    }
  }

  private vncURL(id: string): string {
    const suffix = `containers-vnc/${id.substring(0, 12)}`;
    return `${environment.docker.proxyHost}/${suffix}/vnc_lite.html?path=${suffix}&resize=remote`;
  }

  async unzip(projectId: string, zip: Express.Multer.File): Promise<void> {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const targetPath: string = `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}/`;
    const admZip = new AdmZip(zip.buffer);
    admZip.extractAllTo(targetPath, true);
  }
}
