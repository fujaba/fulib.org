import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CreateAssignmentDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment, AssignmentDocument} from './assignment.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('assignments') private model: Model<Assignment>,
  ) {
  }

  async create(dto: CreateAssignmentDto): Promise<AssignmentDocument> {
    return this.model.create(dto);
  }

  async findAll(): Promise<AssignmentDocument[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<AssignmentDocument | undefined> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<AssignmentDocument | undefined> {
    return this.model.findByIdAndDelete(id);
  }
}
