import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Project, ProjectDocument} from './project.schema';
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";

@Injectable()
@EventRepository()
export class ProjectService extends MongooseRepository<Project> {
  constructor(
    @InjectModel(Project.name) model: Model<Project>,
    private eventService: EventService,
  ) {
    super(model);
  }

  emit(event: string, project: ProjectDocument) {
    this.eventService.emit(`projects.${project._id}.${event}`, project);
  }

  isAuthorized(project: Project, user: UserToken) {
    return project.userId === user.sub;
  }
}
