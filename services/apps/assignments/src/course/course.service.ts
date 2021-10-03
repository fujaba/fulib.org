import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model} from 'mongoose';
import {CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course, CourseDocument} from './course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('courses') private model: Model<Course>,
    @InjectConnection() private connection: Connection,
  ) {
    this.migrate();
  }

  async migrate() {
    const collection = this.connection.collection('courses');
    const result = await collection.updateMany({}, {
      $rename: {
        // TODO id: '_id'
        assignmentIds: 'assignments',
        userId: 'createdBy',
      },
      $unset: {
        descriptionHtml: 1,
      },
    });
    console.info('Migrated', result.modifiedCount, 'courses');
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

  async findOne(id: string): Promise<CourseDocument | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course | null> {
    return this.model.findByIdAndUpdate(id, dto, {new: true}).exec();
  }

  async remove(id: string): Promise<CourseDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
