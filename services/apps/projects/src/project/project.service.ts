import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import * as fs from 'fs';
import {FilterQuery, Model, Types} from 'mongoose';
import * as path from 'path';
import {environment} from '../environment';
import {CreateProjectDto, UpdateProjectDto} from './project.dto';
import {Project, ProjectDocument} from './project.schema';

const projectStorageTypes = ['projects', 'config'] as const;
type ProjectStorageType = typeof projectStorageTypes[number];
const userStorageTypes = ['users'] as const;
type UserStorageType = typeof userStorageTypes[number];
const bindPrefix = path.resolve(environment.docker.bindPrefix);

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private model: Model<Project>,
  ) {
  }

  async create(dto: CreateProjectDto, userId: string): Promise<ProjectDocument> {
    return this.model.create({
      ...dto,
      userId,
      created: new Date(),
    });
  }

  async findAll(where: FilterQuery<Project> = {}): Promise<Project[]> {
    return this.model.find(where).sort('+name').exec();
  }

  async findOne(id: Types.ObjectId): Promise<ProjectDocument | null> {
    return this.model.findById(id).exec();
  }

  async update(id: Types.ObjectId, dto: UpdateProjectDto): Promise<Project | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: Types.ObjectId): Promise<ProjectDocument | null> {
    const project = await this.model.findByIdAndDelete(id).exec();
    if (project) {
      this.removeStorage(id.toString());
    }
    return project;
  }

  private removeStorage(id: string) {
    for (let type of projectStorageTypes) {
      fs.promises.rm(this.getStoragePath(type, id), {recursive: true}).catch(e => {
        console.error(`Failed to remove project '${id}' storage '${type}': ${e.message}`);
      });
    }
  }

  isAuthorized(project: Project, user: UserToken) {
    return project.userId === user.sub;
  }

  getStoragePath(type: ProjectStorageType | UserStorageType, projectId: string): string {
    return `${bindPrefix}/${type}/${this.idBin(projectId)}/${projectId}/`;
  }

  private idBin(projectId: string) {
    return projectId.slice(-2); // last 2 hex chars
  }
}
