import {EventService} from '@mean-stream/nestx';
import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {AssigneeService} from '../assignee/assignee.service';
import {AuthorInfo} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {idFilter} from '../utils';
import {CourseStudent, CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course, CourseDocument} from './course.schema';

@Injectable()
export class CourseService implements OnModuleInit {
  constructor(
    @InjectModel(Course.name) private model: Model<Course>,
    private solutionService: SolutionService,
    private assigneeService: AssigneeService,
    private eventService: EventService,
  ) {
  }

  async onModuleInit() {
    const result = await this.model.updateMany({
      $or: [
        {assignmentIds: {$exists: true}},
        {userId: {$exists: true}},
        {descriptionHtml: {$exists: true}},
      ]
    }, {
      $rename: {
        assignmentIds: 'assignments',
        userId: 'createdBy',
      },
      $unset: {
        descriptionHtml: 1,
      },
    });
    result.modifiedCount && new Logger(CourseService.name).warn(`Migrated ${result.modifiedCount} courses`);
  }

  async create(dto: CreateCourseDto, userId?: string): Promise<CourseDocument> {
    const created = await this.model.create({
      ...dto,
      createdBy: userId,
    });
    this.emit('created', created);
    return created;
  }

  async findAll(filter: FilterQuery<Course> = {}): Promise<CourseDocument[]> {
    return this.model.find(filter).exec();
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
    const solutions = await this.solutionService.model.aggregate([
      {$match: {assignment: {$in: course.assignments}}},
      {$addFields: {id: {$toString: '$_id'}}},
      {
        $lookup: {
          from: 'assignees',
          localField: 'id',
          foreignField: 'solution',
          as: '_assignees',
        },
      },
      {$addFields: {assignee: {$first: '$_assignees.assignee'}}},
      {
        $project: {
          assignment: 1,
          _id: 1,
          assignee: 1,
          author: 1,
          points: 1,
        },
      },
      {$sort: {'author.name': 1, 'author.github': 1}},
    ]);

    const keys: (keyof AuthorInfo)[] = ['studentId', 'email', 'github', 'name'];
    for (const solution of solutions) {
      const {assignment, _id, assignee, author, points} = solution;
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
          solutions: Array(course.assignments.length).fill(null),
        };
      }
      for (const key of keys) {
        const value = author[key];
        if (value) {
          students.set(value, student);
        }
      }

      const index = course.assignments.indexOf(assignment);
      student.solutions[index] = {
        _id: _id.toString(),
        points,
        assignee,
      };
    }
    return Array.from(new Set(students.values()));
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
    this.eventService.emit(`courses.${course.id}.${event}`, course);
  }
}
