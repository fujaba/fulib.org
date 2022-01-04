import {UserToken} from '@app/keycloak-auth';
import {Injectable, MessageEvent} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {filter, Observable, Subject} from 'rxjs';
import {idFilter} from '../utils';
import {CreateCommentDto, UpdateCommentDto} from './comment.dto';
import {Comment, CommentDocument} from './comment.schema';

@Injectable()
export class CommentService {
  private events$ = new Subject<MessageEvent>();

  constructor(
    @InjectModel('comments') private model: Model<Comment>,
  ) {
    this.migrate();
  }

  async migrate() {
    const result = await this.model.updateMany({}, {
      // TODO assignment
      $rename: {
        parent: 'solution',
        userId: 'createdBy',
        timeStamp: 'timestamp',
        markdown: 'body',
      },
      $unset: {
        html: 1,
      },
    });
    console.info('Migrated', result.modifiedCount, 'comments');
  }

  stream(assignment: string, solution: string): Observable<MessageEvent> {
    return this.events$.pipe(filter(({data}) => {
      console.log(data);
      const comment = (data as any).comment as Comment;
      return comment.assignment === assignment && comment.solution === solution;
    }));
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
    return this.model.findOne(idFilter(id)).exec();
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment | null> {
    const updated = await this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async remove(id: string): Promise<CommentDocument | null> {
    const deleted = await this.model.findOneAndDelete(idFilter(id)).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  isAuthorized(comment: Comment, bearerToken: UserToken) {
    return bearerToken.sub === comment.createdBy;
  }

  private emit(event: string, comment: CommentDocument) {
    this.events$.next({data: {event, comment}});
  }
}
