import {Injectable} from '@nestjs/common';
import Dockerode from 'dockerode';
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

  async create(id: string): Promise<Container> {
    throw new Error('Not implemented');
  }

  async findOne(id: string): Promise<Container | null> {
    // TODO can't we apply filters before listing ALL containers?
    const containers = await this.docker.listContainers({});
    const container = containers.find(c => (c.Status === 'created' || c.Status === 'running') && c.Labels['org.fulib.project'] === id);
    if (!container) {
      return null;
    }

    return {
      id: container.Id,
      projectId: id,
      url: this.containerUrl(container.Id),
    };
  }

  async remove(id: string): Promise<Container | null> {
    throw new Error('Not implemented');
  }

  private containerUrl(id: string): string {
    return `${environment.docker.proxyHost}/containers/${id.substring(0, 12)}`;
  }
}
