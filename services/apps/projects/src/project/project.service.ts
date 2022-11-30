import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as fs from 'fs';
import {FilterQuery, Model} from 'mongoose';
import * as path from 'path';
import {environment} from '../environment';
import {CreateProjectDto, UpdateProjectDto} from './project.dto';
import {Project, ProjectDocument} from './project.schema';

const storageTypes = ['projects', 'config'] as const;
const bindPrefix = path.resolve(environment.docker.bindPrefix);

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('projects') private model: Model<Project>,
  ) {
  }

  async create(dto: CreateProjectDto, userId: string): Promise<ProjectDocument> {
    const project: Project = {
      ...dto,
      userId,
      created: new Date(),
    };
    return this.model.create(project);
  }

  async findAll(where: FilterQuery<Project> = {}): Promise<Project[]> {
    return this.model.find(where).sort('+name').exec();
  }

  async findOne(id: string): Promise<ProjectDocument | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<ProjectDocument | null> {
    const project = await this.model.findByIdAndDelete(id).exec();
    if (project) {
      this.removeStorage(id);
    }
    return project;
  }

  private removeStorage(id: string) {
    for (let type of storageTypes) {
      fs.promises.rm(this.getStoragePath(type, id), {recursive: true}).catch(e => {
        console.error(`Failed to remove project '${id}' storage '${type}': ${e.message}`);
      });
    }
  }

  isAuthorized(project: Project, user: UserToken) {
    return project.userId === user.sub;
  }

  getStoragePath(type: (typeof storageTypes)[number], projectId: string): string {
    return `${bindPrefix}/${type}/${this.idBin(projectId)}/${projectId}/`;
  }

  private idBin(projectId: string) {
    return projectId.slice(-2); // last 2 hex chars
  }
}
