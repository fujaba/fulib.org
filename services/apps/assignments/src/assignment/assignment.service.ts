import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {generateToken} from '../utils';
import {CreateAssignmentDto, ReadAssignmentDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment, AssignmentDocument} from './assignment.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('assignments') private model: Model<Assignment>,
    @InjectConnection() private connection: Connection,
  ) {
    this.migrate();
  }

  async migrate() {
    const collection = this.connection.collection('assignments');
    const result = await collection.updateMany({}, {
      $rename: {
        // TODO id: '_id'
        userId: 'createdBy',
      },
      $unset: {
        descriptionHtml: 1,
      },
    });
    console.info('Migrated', result.modifiedCount, 'assignments');
  }

  async create(dto: CreateAssignmentDto, userId?: string): Promise<AssignmentDocument> {
    const token = generateToken();
    return this.model.create({
      ...dto,
      token,
      createdBy: userId,
    });
  }

  async findAll(where: FilterQuery<Assignment> = {}): Promise<ReadAssignmentDto[]> {
    return this.model.find(where).select(['-token', '-solution', '-tasks.verification']).exec();
  }

  async findOne(id: string): Promise<AssignmentDocument | null> {
    return this.model.findById(id).exec();
  }

  mask(assignment: Assignment): ReadAssignmentDto {
    const {token, solution, tasks, ...rest} = assignment;
    return {
      ...rest,
      tasks: assignment.tasks.map(({verification, ...rest}) => rest),
    } as ReadAssignmentDto;
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<AssignmentDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  isAuthorized(assignment: Assignment, user?: UserToken, token?: string): boolean {
    return assignment.token === token || !!user && user.sub === assignment.createdBy;
  }
}
