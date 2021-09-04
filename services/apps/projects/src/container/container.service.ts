import {Injectable} from '@nestjs/common';
import * as Dockerode from 'dockerode';
import * as path from 'path';
import {environment} from '../environment';
import {ContainerDto} from './container.dto';

@Injectable()
export class ContainerService {
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
    const container = await this.docker.createContainer({
      Image: environment.docker.containerImage,
      Tty: true,
      NetworkingConfig: {
        EndpointsConfig: {
          'fulib-projects': {},
        },
      },
      HostConfig: {
        AutoRemove: true,
        Binds: [
          `${bindPrefix}/projects/${this.idBin(projectId)}/${projectId}:/projects/${projectId}`,
        ],
      },
      Env: [
        `PROJECT_ID=${projectId}`,
      ],
      Labels: {
        'org.fulib.project': projectId,
      },
    });
    await container.start();
    return this.toContainer(container.id, projectId);
  }

  async findOne(projectId: string): Promise<ContainerDto | null> {
    // TODO can't we apply filters before listing ALL containers?
    const containers = await this.docker.listContainers({});
    const container = containers.find(c => (c.State === 'created' || c.State === 'running') && c.Labels['org.fulib.project'] === projectId);
    if (!container) {
      return null;
    }
    return this.toContainer(container.Id, projectId);
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

  private toContainer(id: string, projectId: string) {
    return {
      id,
      projectId,
      url: this.containerUrl(id),
    };
  }

  private containerUrl(id: string): string {
    return `${environment.docker.proxyHost}/containers/${id.substring(0, 12)}`;
  }

  private idBin(projectId: string) {
    return projectId.slice(-2); // last 2 hex chars
  }
}
