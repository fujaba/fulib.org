import {Injectable} from '@nestjs/common';
import {Container} from '../../../../../frontend/src/app/projects/model/container';

@Injectable()
export class ContainerService {
  async create(id: string): Promise<Container> {
    throw new Error('Not implemented');
  }

  async findOne(id: string): Promise<Container | null> {
    throw new Error('Not implemented');
  }

  async remove(id: string): Promise<Container | null> {
    throw new Error('Not implemented');
  }
}
