import {Injectable} from '@nestjs/common';
import {randomBytes} from 'crypto';
import * as Dockerode from 'dockerode';
import * as path from 'path';
import {environment} from '../environment';
import {ContainerDto} from './container.dto';
import * as fs from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { setTimeout } from "timers/promises";

// when there is no connection for at least IDLE_TIME (ms) to a code-server container,
// the container will stop
// 300.000ms = 5min
const IDLE_TIME = 300_000


@Injectable()
export class ContainerService {

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


          // bind configuration files (for example extensions and user settings can be found in here)
          // the heartbeat file is also included there (/home/coder/.local/share/code-server/heartbeat)
          // heartbeatfile: is modified by code-server every minute if there's an active connection
          `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}:/home/coder/.local/share/code-server`,

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
    await this.preinstallExtension(projectId, 'redhat.java-1.7.0');

    // wait 1s for container startup
    // without waiting we're getting 502 - Bad Gateway Error on the code server iframe on first loading
    const wait = async () => {
      await setTimeout(1000);
    };
    await wait();
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
      let p = this.getHeartbeatPath(projectId);

      if(await this.isHeartbeatExpired(p)) {
        this.remove(projectId);
      }
    }

  }

  private getHeartbeatPath(projectId: string) {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    return path.resolve(`${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/heartbeat`);
  }

  private async isHeartbeatExpired(path: string) : Promise<boolean> {
    // fetch file details
    const stat = await fs.promises.stat(path);
    let heartbeatTime = stat.mtime.getTime();
    let currentTime = Date.now();
    return currentTime - heartbeatTime >= IDLE_TIME;
  }


  //install a vs code extension by simply copy the extension folder in the related directory
  private async preinstallExtension(projectId: string, extension: string) {
    const bindPrefix = path.resolve(environment.docker.bindPrefix);
    const fse = require('fs-extra');
    let srcDir = `${bindPrefix}/preinstall/${extension}`;
    let destDir = `${bindPrefix}/config/${this.idBin(projectId)}/${projectId}/extensions/${extension}`;
    await fse.copy(srcDir, destDir);
  }

}
