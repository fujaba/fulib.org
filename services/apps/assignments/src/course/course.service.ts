import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course, CourseDocument} from './course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('courses') private model: Model<Course>,
  ) {
  }

  async create(dto: CreateCourseDto, userId?: string): Promise<CourseDocument> {
    return this.model.create({
      ...dto,
      createdBy: userId,
    });
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<CourseDocument | undefined> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course | undefined> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<Course | undefined> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
