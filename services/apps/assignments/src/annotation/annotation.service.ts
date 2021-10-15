import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {CreateAnnotationDto, UpdateAnnotationDto} from './annotation.dto';
import {Annotation} from './annotation.schema';

@Injectable()
export class AnnotationService {
  constructor(
    @InjectModel('annotations') private model: Model<Annotation>,
  ) {
  }

  async create(assignment: string, solution: string, dto: CreateAnnotationDto): Promise<Annotation> {
    return this.model.create({
      assignment,
      solution,
      ...dto,
    });
  }

  async findAll(where: FilterQuery<Annotation> = {}): Promise<Annotation[]> {
    return this.model.find(where).exec();
  }

  async findOne(id: string): Promise<Annotation | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateAnnotationDto): Promise<Annotation | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<Annotation | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
