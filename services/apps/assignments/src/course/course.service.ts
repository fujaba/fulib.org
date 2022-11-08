import {EventService} from '@app/event';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {ReadSolutionDto} from '../solution/solution.dto';
import {AuthorInfo} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {idFilter} from '../utils';
import {CourseStudent, CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course, CourseDocument} from './course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('courses') private model: Model<Course>,
    private solutionService: SolutionService,
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

  async getStudents(id: string): Promise<CourseStudent[]> {
    const course = await this.findOne(id);
    if (!course) {
      return [];
    }
    const students = new Map<string, CourseStudent>();
    const solutions = await this.solutionService.findAll({assignment: {$in: course.assignments}});
    const keys: (keyof AuthorInfo)[] = ['studentId', 'email', 'github', 'name'];
    for (const solution of solutions) {
      const {assignment, _id, author, points} = solution;
      let student: CourseStudent | undefined = undefined;
      for (const key of keys) {
        const value = author[key];
        if (value && (student = students.get(value))) {
          break;
        }
      }
      if (!student) {
        student = {
          author,
          solutions: Array(course.assignments.length).fill(''),
          points: Array(course.assignments.length).fill(0),
        };
      }
      for (const key of keys) {
        const value = author[key];
        if (value) {
          students.set(value, student);
        }
      }

      let index = course.assignments.indexOf(assignment);
      student.solutions[index] = _id.toString();
      student.points[index] = points || 0;
    }
    return Array.from(students.values());
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
