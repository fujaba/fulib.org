import {Injectable} from '@nestjs/common';
import Dockerode from 'dockerode';
import path from 'path';
import {Container} from '../../../../../frontend/src/app/projects/model/container';
import {environment} from '../environment';

@Injectable()
export class ContainerService {
  docker = new Dockerode({
    host: environment.docker.host,
    port: environment.docker.port,
    socketPath: environment.docker.socket,
    version: environment.docker.version,
  });

  async create(projectId: string): Promise<Container> {
    return await this.findOne(projectId) ?? await this.start(projectId);
  }

  async start(projectId: string): Promise<Container> {
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
          `${bindPrefix}:/projects/${projectId}`,
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

  async findOne(projectId: string): Promise<Container | null> {
    // TODO can't we apply filters before listing ALL containers?
    const containers = await this.docker.listContainers({});
    const container = containers.find(c => (c.Status === 'created' || c.Status === 'running') && c.Labels['org.fulib.project'] === projectId);
    if (!container) {
      return null;
    }
    return this.toContainer(container.Id, projectId);
  }

  async remove(projectId: string): Promise<Container | null> {
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
}
