import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {idFilter} from '../utils';
import {CreateCommentDto, UpdateCommentDto} from './comment.dto';
import {Comment, CommentDocument} from './comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('comments') private model: Model<Comment>,
    @InjectConnection() connection: Connection,
  ) {
    connection.once('connected', () => this.migrate());
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

  async create(assignment: string, solution: string, dto: CreateCommentDto, distinguished: boolean, createdBy?: string): Promise<CommentDocument> {
    const comment: Comment = {
      ...dto,
      assignment,
      solution,
      createdBy,
      distinguished,
      timestamp: new Date(),
    };
    return this.model.create(comment);
  }

  async findAll(where: FilterQuery<Comment> = {}): Promise<CommentDocument[]> {
    return this.model.find(where).sort('+timestamp').exec();
  }

  async findOne(id: string): Promise<CommentDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment | null> {
    return this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
  }

  async remove(id: string): Promise<CommentDocument | null> {
    return this.model.findOneAndDelete(idFilter(id)).exec();
  }

  isAuthorized(comment: Comment, bearerToken: UserToken) {
    return bearerToken.sub === comment.createdBy;
  }
}
