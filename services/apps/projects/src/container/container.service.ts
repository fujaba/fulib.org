import {Injectable} from '@nestjs/common';
import {randomBytes} from 'crypto';
import * as Dockerode from 'dockerode';
import * as path from 'path';
import {environment} from '../environment';
import {ContainerDto} from './container.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { setTimeout } from 'timers/promises';
import {HttpService} from '@nestjs/axios';
import {firstValueFrom} from 'rxjs';
import * as fs from 'fs';


@Injectable()
export class ContainerService {

  constructor(private readonly httpService: HttpService) {}

  private codeWorkspace: string = '/home/coder/project';

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    this.checkAllHeartbeats();
  }

  docker = new Dockerode({
    host: environment.docker.host,
    port: environment.docker.port,
    socketPath: environment.docker.socket,
    version: environment.docker.version,
  });


  async create(projectId: string): Promise<ContainerDto> {
    return await this.findOne(projectId) ?? await this.start(projectId);
  }

  async start(projectId: string): Promise<ContainerDto> {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const token = randomBytes(10).toString('base64');

    /* create 'settings.json' file if it doesn't exist already
    code server will write the user settings there
    if we won't create the file, docker will automatically
    create a directory instead, which will lead to an error
    when code server is trying to write on the bind mount
     */
    const settingsFile = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/settings.json`
    const settingsDir = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/`
    await fs.promises.readFile(settingsFile).catch( async () => {
      await fs.promises.mkdir(settingsDir, {recursive: true});
      await fs.promises.writeFile(settingsFile, "");
    });


    const container = await this.docker.createContainer({
      Image: environment.docker.containerImage,
      Tty: true,
      NetworkingConfig: {
        EndpointsConfig: {
          [environment.docker.network]: {
          },
        },
      },
      HostConfig: {
        AutoRemove: true,
        Binds: [
          //workspace bind
          `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}:${this.codeWorkspace}`,

          // vs code settings bind
          `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/settings.json:/home/coder/.local/share/code-server/User/settings.json`,
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
      // docker run params
      Cmd: ['--auth','none'], //no password for code-server required
    });

    await container.start();

    // wait 1s for container startup
    // without waiting we're getting 502 - Bad Gateway Error on the code server iframe on first loading
    const wait = async () => {
      await setTimeout(1000);
    };
    await wait();

    // loop over extensions list and install all extensions
    await this.installExtensions(container, projectId);

    return this.toContainer(container.id, token, projectId);
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
    const stream = await this.containerExec(container,['code-server', '--list-extensions']);
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const extensionsList = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/extensions.txt`;
    let writeStream = fs.createWriteStream(extensionsList);
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
    for(let i = 0; i < containers.length; i++) {
      let container = containers[i];
      let projectId = container['Labels']['org.fulib.project'];

      if(await this.isHeartbeatExpired(container.Id)) {
        this.remove(projectId);
      }
    }

  }

  private async isHeartbeatExpired(containerId: string) : Promise<boolean> {
    const url = `${environment.docker.proxyHost}/containers/${containerId.substring(0, 12)}`;
    const res =  await firstValueFrom(this.httpService.get(`${url}/healthz`));
    return (res.data.status === 'expired');
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
  private streamOnEndWorkaround(exec: Dockerode.Exec, stream: any): Promise<void>{
    const finish = new Promise<void>((resolve) => {
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
    return finish;
  }


  private async installExtensions(container: Dockerode.Container, projectId: string) {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const extensionsListPath = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/User/extensions.txt`;

    let fileBuffer = await fs.promises.readFile(extensionsListPath).catch( async() => {
      //create extensions.txt if not exists
      await fs.promises.writeFile(extensionsListPath, "");
    });

    if(fileBuffer) {
      let fileText = fileBuffer.toString('utf-8');
      let array = fileText.split(/\r?\n/);
      for(let i=0; i < array.length; ++i) {
        array[i] = array[i].replace(/[^\w\d\s\\.\-]/g, '');
        array[i] = array[i].trim();
      }
      // filter array for empty or undefined values
      let cleanArr = array.filter(Boolean);
      for(let i=0; i < cleanArr.length; ++i) {
        //install
        let stream = await this.containerExec(container,['code-server', '--install-extension', cleanArr[i]]);
        //output to console
        stream.pipe(process.stdout);
      }
    }
  }

}
