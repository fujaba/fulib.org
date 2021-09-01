import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {randomBytes} from 'crypto';
import {Model} from 'mongoose';
import {CreateAssignmentDto, ReadAssignmentDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment, AssignmentDocument} from './assignment.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('assignments') private model: Model<Assignment>,
  ) {
  }

  generateToken(): string {
    const bytes = randomBytes(8);
    const hex = bytes.toString('hex');
    const [, a, b, c, d] = /(.{4})(.{4})(.{4})(.{4})/.exec(hex);
    return `${a}-${b}-${c}-${d}`;
  }

  async create(dto: CreateAssignmentDto, userId?: string): Promise<AssignmentDocument> {
    const token = this.generateToken()
    return this.model.create({
      ...dto,
      token,
      userId,
    });
  }

  async findAll(): Promise<ReadAssignmentDto[]> {
    return this.model.find().select(['-token', '-solution', '-tasks.verification']).exec();
  }

  async findOne(id: string): Promise<AssignmentDocument | undefined> {
    return this.model.findById(id).exec();
  }

  mask(assignment: Assignment): ReadAssignmentDto {
    const {token, solution, tasks, ...rest} = assignment;
    return {
      ...rest,
      tasks: assignment.tasks.map(({verification, ...rest}) => rest),
    } as ReadAssignmentDto;
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<AssignmentDocument | undefined> {
    return this.model.findByIdAndDelete(id);
  }
}
