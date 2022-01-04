import {EventService} from '@app/event';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {idFilter} from '../utils';
import {CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course, CourseDocument} from './course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('courses') private model: Model<Course>,
    private eventService: EventService,
  ) {
    this.migrate();
  }

  async migrate() {
    const result = await this.model.updateMany({}, {
      $rename: {
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
    const created = await this.model.create({
      ...dto,
      createdBy: userId,
    });
    this.emit('created', created);
    return created;
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<CourseDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course | null> {
    const updated = await this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async remove(id: string): Promise<CourseDocument | null> {
    const deleted = await this.model.findOneAndDelete(idFilter(id)).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private emit(event: string, course: CourseDocument) {
    this.eventService.emit(`comment.${course.id}.${event}`, {event, data: course});
  }
}
