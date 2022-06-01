import {Injectable} from '@nestjs/common';
import {randomBytes} from 'crypto';
import * as Dockerode from 'dockerode';
import * as path from 'path';
import {environment} from '../environment';
import {ContainerDto} from './container.dto';
import * as fs from 'fs';

// when there is no connection to a code-server container, it will be closed after this time passed (in ms)
// 300.000ms = 5min
const IDLE_TIME = 300_000

// Every CHECK_INTERVAL ms the bound heartbeat file will be checked for modification
// the heartbeat file is modified by code-server every minute if there's an active connection
const CHECK_INTERVAL = 30_000

@Injectable()
export class ContainerService {

  private codeWorkspace: string = '/home/coder/project';
  private timersMap = new Map<string, NodeJS.Timer>();

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

          `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}:${this.codeWorkspace}`,
          `${bindPrefix}/heartbeats/${this.idBin(projectId)}/${projectId}:/home/coder/.local/share/code-server`,
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

    let timer = setInterval(() => {
      this.checkHeartbeat(projectId);
    }, CHECK_INTERVAL)
    this.timersMap.set(projectId, timer);

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

  private checkHeartbeat(projectId: string) {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const p = path.resolve(`${bindPrefix}/heartbeats/${this.idBin(projectId)}/${projectId}/heartbeat`);

    // fetch file details
    fs.stat(p, (err, stats) => {
      if(err) {
        throw err;
      }
      let heartbeatTime = stats.mtime.getTime();
      let currentTime = Date.now();

      console.log(`${projectId} idle: ${currentTime - heartbeatTime} ms`);
      if (currentTime - heartbeatTime >= IDLE_TIME) {
        console.log(`try to stop container with Project ID: ${projectId}`)
        this.remove(projectId);

        // stop the setInterval()
        clearInterval(this.timersMap.get(projectId));
      }
    });
  }

}
