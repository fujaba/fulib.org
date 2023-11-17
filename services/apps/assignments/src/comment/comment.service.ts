import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Comment, CommentDocument} from './comment.schema';

@Injectable()
@EventRepository()
export class CommentService extends MongooseRepository<Comment> {
  constructor(
    @InjectModel(Comment.name) public model: Model<Comment>,
    private eventService: EventService,
  ) {
    super(model);
  }

  isAuthorized(comment: Comment, bearerToken: UserToken) {
    return bearerToken.sub === comment.createdBy;
  }

  private emit(event: string, comment: CommentDocument) {
    // TODO only emit to users that have access to the assignment or solution
    this.eventService.emit(`assignments.${comment.assignment}.solutions.${comment.solution}.comments.${comment._id}.${event}`, comment);
  }

  subscribe(assignment: Types.ObjectId, solution: Types.ObjectId, comment: string, event: string, user?: string) {
    return this.eventService.subscribe<Comment>(`assignments.${assignment}.solutions.${solution}.comments.${comment}.${event}`, user);
  }
}
