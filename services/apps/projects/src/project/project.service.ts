import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {CreateProjectDto, UpdateProjectDto} from './project.dto';
import {Project, ProjectDocument} from './project.schema';

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
    return this.model.findByIdAndDelete(id).exec();
  }

  isAuthorized(project: Project, user: UserToken) {
    return project.userId === user.sub;
  }
}
