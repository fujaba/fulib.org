import {UserToken} from '@app/keycloak-auth';
import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import * as chownr from 'chownr';
import {randomBytes} from 'crypto';
import * as Dockerode from 'dockerode';
import {ContainerCreateOptions} from 'dockerode';
import * as fs from 'fs';
import * as path from 'path';
import {firstValueFrom, map} from 'rxjs';
import {Readable} from 'stream';
import {setTimeout} from 'timers/promises';
import {Extract} from 'unzipper';
import {environment} from '../environment';
import {Project} from '../project/project.schema';
import {ProjectService} from '../project/project.service';
import {ContainerDto, CreateContainerDto} from './container.dto';

const CODE_WORKSPACE = '/home/coder/project';

@Injectable()
export class ContainerService {
  docker = new Dockerode({
    host: environment.docker.host,
    port: environment.docker.port,
    socketPath: environment.docker.socket,
    version: environment.docker.version,
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly projectService: ProjectService,
  ) {
  }

  async create(project: Project, user: UserToken, auth: string): Promise<ContainerDto> {
    const {_id, dockerImage, repository} = project;
    return await this.findOne(_id.toString(), user.sub) ?? await this.start({
      projectId: _id.toString(),
      dockerImage,
      repository,
    }, user, auth);
  }

  async start(dto: CreateContainerDto, user?: UserToken, auth?: string): Promise<ContainerDto> {
    const token = randomBytes(12).toString('base64');

    const options: ContainerCreateOptions = {
      Image: dto.dockerImage || environment.docker.containerImage,
      Tty: true,
      NetworkingConfig: {
        EndpointsConfig: {
          [environment.docker.network]: {},
        },
      },
      HostConfig: {
        AutoRemove: true,
        Binds: [],
      },
      Env: [
        `PASSWORD=${token}`,
      ],
      Labels: {
        'org.fulib.token': token,
      },
    };

    let projectPath: string | undefined;
    if (dto.projectId) {
      projectPath = this.projectService.getStoragePath('projects', dto.projectId);
      options.HostConfig!.Binds!.push(`${projectPath}:${CODE_WORKSPACE}`);
      options.Env!.push(`PROJECT_ID=${dto.projectId}`);
      options.Labels!['org.fulib.project'] = dto.projectId;
    }

    if (user) {
      const usersPath = this.projectService.getStoragePath('users', user.sub);

      /* create 'settings.json' files if they don't exist already
      code server will write the user/machine settings there
      if we won't create the file manually, docker will automatically
      create a directory instead when binding it. This will
      lead to an error when code server is trying to write on the bind mount
       */
      await createFile(`${usersPath}/settings.json`);
      await createFile(`${usersPath}/.gitconfig`, async () => await this.generateGitConfig(user, auth));
      options.Labels!['org.fulib.user'] = user.sub;
      options.HostConfig!.Binds!.push(
        `${usersPath}/settings.json:/home/coder/.local/share/code-server/User/settings.json`,
        `${usersPath}/.gitconfig:/home/coder/.gitconfig`,
      );
    }

    const container = await this.docker.createContainer(options);

    await container.start();

    this.installExtensions(container, [
      ...(dto.projectId ? await this.getProjectExtensions(dto.projectId) : []),
      ...(dto.extensions || []),
    ]);

    const containerDto = this.toContainer(container.id, token, dto.projectId);

    if (dto.repository) {
      await this.cloneRepository(container, dto.repository);
    } else if (projectPath) {
      await this.checkIsNew(projectPath, containerDto);
    } else {
      containerDto.isNew = true;
    }

    // FIXME VNC should work for temporary containers as well
    projectPath && await this.writeVncUrl(projectPath, containerDto);

    if (dto.machineSettings) {
      await this.setMachineSettings(container, dto.machineSettings);
    }

    await this.waitForContainer(containerDto);
    return containerDto;
  }

  private async generateGitConfig(user: UserToken | undefined, auth: string | undefined): Promise<string> {
    let config = '[user]\n';
    const name = user?.name || user?.preferred_username;
    name && (config += `name = ${name}\n`);
    user?.email && (config += `email = ${user.email}\n`);
    const token = auth && await this.getGitHubToken(auth);
    token && (config += `[url "https://${token}@github.com"]\ninsteadOf = https://github.com\n`);
    return config;
  }

  private async getGitHubToken(auth: string): Promise<string | undefined> {
    const paramName = 'access_token=';
    return firstValueFrom(this.httpService.get<string>(`${environment.auth.url}/realms/${environment.auth.realm}/broker/github/token`, {
      responseType: 'text',
      headers: {
        Authorization: auth,
      },
    }).pipe(
      map(({data}) => data.split('&').filter(s => s.startsWith(paramName))[0]?.substring(paramName.length)),
    ));
  }

  private toContainer(id: string, token: string, projectId?: string): ContainerDto {
    return {
      id,
      projectId,
      token,
      url: `${this.containerUrl(id)}/?folder=${CODE_WORKSPACE}&ngsw-bypass`,
      vncUrl: this.vncURL(id),
      isNew: false,
    };
  }

  private containerUrl(id: string): string {
    return `${environment.docker.proxyHost}/containers/${id.substring(0, 12)}`;
  }

  private vncURL(id: string): string {
    const suffix = `containers-vnc/${id.substring(0, 12)}`;
    return `${environment.docker.proxyHost}/${suffix}/vnc_lite.html?path=${suffix}&resize=remote`;
  }

  private async getProjectExtensions(projectId: string): Promise<string[]> {
    const extensionsListPath = `${this.projectService.getStoragePath('config', projectId)}/extensions.txt`;

    const fileBuffer = await fs.promises.readFile(extensionsListPath).catch(() => '');
    if (!fileBuffer) {
      return [];
    }

    const fileText = fileBuffer.toString('utf-8');
    return fileText.split(/\r?\n/).map(s => s.trim()).filter(s => s);
  }

  private async installExtensions(container: Dockerode.Container, extensions: string[]) {
    await Promise.all(extensions.map(extension => this.containerExec(container, ['code-server', '--install-extension', extension])));
  }

  private async containerExec(container: Dockerode.Container, command: string[]) {

    const exec = await container.exec({
      Cmd: command,
      AttachStderr: true,
      AttachStdout: true,
    });

    const stream = await exec.start({});
    container.modem.demuxStream(stream, process.stdout, process.stderr);
    await streamOnEndWorkaround(exec, stream);
    return stream;
  }

  private async cloneRepository(container: Dockerode.Container, repository: string) {
    const hashIndex = repository.indexOf('#');
    let ref: string | undefined;
    if (hashIndex >= 0) {
      ref = repository.substring(hashIndex + 1);
      repository = repository.substring(0, hashIndex);
    }
    await this.containerExec(container, ['git', 'clone', repository, CODE_WORKSPACE]);
    if (ref) {
      await this.containerExec(container, ['git', '-C', CODE_WORKSPACE, 'checkout', ref]);
    }
  }

  private async writeVncUrl(projectPath: string, containerDto: ContainerDto) {
    // TODO maybe there is a more elegant way for passing the vnc url into the extension ?
    const p = `${projectPath}/.vnc/vncUrl`;
    await createFile(p);
    await fs.promises.writeFile(p, containerDto.vncUrl);
  }

  private async setMachineSettings(container: Dockerode.Container, settings: object) {
    const eofMarker = randomBytes(16).toString('hex');
    await this.containerExec(container, ['sh', '-c', `cat > /home/coder/.local/share/code-server/Machine/settings.json <<${eofMarker}
${JSON.stringify(settings)}
${eofMarker}`]);
  }

  private async checkIsNew(projectPath: string, containerDto: ContainerDto) {
    const files = await fs.promises.readdir(projectPath).catch(() => []);
    if (!files.length) {
      containerDto.isNew = true;
    }
  }

  private async waitForContainer(containerDto: ContainerDto) {
    const containerURL = containerDto.url;
    let retries = 0;
    while (!(await this.isContainerReady(containerURL)) && (retries <= 10)) {
      await setTimeout(400);
      retries++;
      if (retries >= 11) {
        console.log('timeout: couldn\'t reach vs code UI after 4 seconds. Maybe try a reload.');
      }
    }
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

  async findOne(projectId: string, userId: string): Promise<ContainerDto | null> {
    const containers = await this.docker.listContainers({
      all: 1,
      limit: 1,
      filters: {
        status: ['created', 'running'],
        label: [`org.fulib.project=${projectId}`, `org.fulib.user=${userId}`],
      },
    });
    if (containers.length === 0) {
      return null;
    }
    return this.toContainer(containers[0].Id, projectId, containers[0].Labels['org.fulib.token']);
  }

  async remove(projectId: string, userId: string): Promise<ContainerDto | null> {
    const existing = await this.findOne(projectId, userId);
    if (!existing) {
      return null;
    }
    const container = this.docker.getContainer(existing.id);

    const stream = await this.containerExec(container, ['code-server', '--list-extensions', '--show-versions']);
    const extensionsList = `${this.projectService.getStoragePath('config', projectId)}/extensions.txt`;
    await createFile(extensionsList);

    const writeStream = fs.createWriteStream(extensionsList);
    container.modem.demuxStream(stream, writeStream, process.stderr);

    await container.stop();
    return existing;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAllHeartbeats() {
    const containers = await this.docker.listContainers({
      filters: {
        label: [`org.fulib.project`],
        status: ['created', 'running'],
      },
    });

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      this.isHeartbeatExpired(container.Id).then(expired => {
        expired && this.remove(container.Labels['org.fulib.project'], container.Labels['org.fulib.user']);
      });
    }

  }

  private async isHeartbeatExpired(containerId: string): Promise<boolean> {
    try {
      const {data} = await firstValueFrom(this.httpService.get(`${this.containerUrl(containerId)}/healthz`));
      // res.data.lastHeartbeat is 0, when container has just started
      return data.status === 'expired' && data.lastHeartbeat && data.lastHeartbeat < Date.now() - environment.docker.heartbeatTimeout;
    } catch (e) {
      //container is in creating phase right now, /healthz endpoint isn't ready yet
      return false;
    }
  }

  async unzip(projectId: string, zip: Express.Multer.File): Promise<void> {
    const storagePath = this.projectService.getStoragePath('projects', projectId);
    const stream = new Readable();
    stream.push(zip.buffer);
    stream.push(null);
    await stream.pipe(Extract({path: storagePath})).promise();
    await new Promise((resolve, reject) => chownr(storagePath, 1000, 1000, err => err ? reject(err) : resolve(undefined)));
  }
}

/** https://github.com/apocas/dockerode/issues/534 stream.on("end", resolve) workaround */
function streamOnEndWorkaround(exec: Dockerode.Exec, stream: any): Promise<void> {
  return new Promise<void>((resolve) => {
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

/** creates file with given path only when the file doesn't exist */
async function createFile(p: string, content: () => string | Promise<string> = () => '') {
  await fs.promises.readFile(p).catch(async () => {
    await fs.promises.mkdir(path.dirname(p), {recursive: true});
    await fs.promises.writeFile(p, await content());
    await fs.promises.chown(p, 1000, 1000);
  });
}
