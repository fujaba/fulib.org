import {EventService} from '@mean-stream/nestx';
import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {CreateCommentDto, UpdateCommentDto} from './comment.dto';
import {Comment, CommentDocument} from './comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) public model: Model<Comment>,
    private eventService: EventService,
  ) {
  }

  async create(assignment: string, solution: string, dto: CreateCommentDto, distinguished: boolean, createdBy?: string): Promise<CommentDocument> {
    const comment: Comment = {
      ...dto,
      assignment,
      solution,
      createdBy,
      distinguished,
      timestamp: new Date(),
    };
    const created = await this.model.create(comment);
    this.emit('created', created);
    return created;
  }

  async findAll(where: FilterQuery<Comment> = {}): Promise<CommentDocument[]> {
    return this.model.find(where).sort('+timestamp').exec();
  }

  async findOne(id: string): Promise<CommentDocument | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment | null> {
    const updated = await this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async remove(id: string): Promise<CommentDocument | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  async removeAll(where: FilterQuery<Comment>): Promise<CommentDocument[]> {
    const comments = await this.findAll(where);
    await this.model.deleteMany({_id: {$in: comments.map(a => a._id)}}).exec();
    for (const comment of comments) {
      this.emit('deleted', comment);
    }
    return comments;
  }

  isAuthorized(comment: Comment, bearerToken: UserToken) {
    return bearerToken.sub === comment.createdBy;
  }

  private emit(event: string, comment: CommentDocument) {
    // TODO only emit to users that have access to the assignment or solution
    this.eventService.emit(`assignments.${comment.assignment}.solutions.${comment.solution}.comments.${comment._id}.${event}`, comment);
  }

  subscribe(assignment: string, solution: string, comment: string, event: string, user?: string) {
    return this.eventService.subscribe<Comment>(`assignments.${assignment}.solutions.${solution}.comments.${comment}.${event}`, user);
  }
}
