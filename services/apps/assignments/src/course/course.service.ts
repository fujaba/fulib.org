import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {AuthorInfo, SOLUTION_COLLATION, SOLUTION_SORT} from '../solution/solution.schema';
import {SolutionService} from '../solution/solution.service';
import {CourseAssignee, CourseStudent} from './course.dto';
import {Course, CourseDocument} from './course.schema';
import {MemberService} from "@app/member";
import {AssigneeService} from "../assignee/assignee.service";

@Injectable()
@EventRepository()
export class CourseService extends MongooseRepository<Course> {
  constructor(
    @InjectModel(Course.name) model: Model<Course>,
    private solutionService: SolutionService,
    private assigneeService: AssigneeService,
    private eventService: EventService,
    private memberService: MemberService,
  ) {
    super(model);
  }

  async getStudents(id: Types.ObjectId, user: string): Promise<CourseStudent[]> {
    const course = await this.find(id);
    if (!course) {
      return [];
    }

    const courseAssignmentsWhereUserIsMember = await this.getCourseAssignmentsWhereUserIsMember(course, user);
    if (!courseAssignmentsWhereUserIsMember.length) {
      return [];
    }

    const students = new Map<string, CourseStudent>();
    const solutions = await this.solutionService.model.aggregate([
      {$match: {assignment: {$in: courseAssignmentsWhereUserIsMember.map(o => o.toString())}}},
      {
        $lookup: {
          from: 'assignees',
          localField: '_id',
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
          feedback: 1,
        },
      },
      {$sort: SOLUTION_SORT},
    ], {
      collation: SOLUTION_COLLATION,
    });

    const keys: (keyof AuthorInfo)[] = ['studentId', 'email', 'github', 'name'];
    for (const solution of solutions) {
      const {assignment, _id, assignee, author, points, feedback} = solution;
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
          feedbacks: 0,
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
      if (feedback && feedback.appropriate && feedback.helpful && feedback.understandable) {
        student.feedbacks++;
      }
    }
    return Array.from(new Set(students.values()));
  }

  private async getCourseAssignmentsWhereUserIsMember(course: CourseDocument, user: string): Promise<Types.ObjectId[]> {
    const userMembers = await this.memberService.findAll({
      parent: {$in: course.assignments.map(a => new Types.ObjectId(a))},
      user,
    });
    return userMembers.map(m => m.parent);
  }

  async getAssignees(id: Types.ObjectId, user: string): Promise<CourseAssignee[]> {
    const course = await this.find(id);
    if (!course) {
      return [];
    }

    const courseAssignmentsWhereUserIsMember = await this.getCourseAssignmentsWhereUserIsMember(course, user);
    if (!courseAssignmentsWhereUserIsMember.length) {
      return [];
    }

    const assigneeMap = new Map<string, CourseAssignee>();
    for await (const aggregateElement of this.assigneeService.model.aggregate<{
      _id: {
        assignee: string,
        assignment: Types.ObjectId,
      },
      solutions: number,
      duration: number,
      feedbacks: number,
    }>([
      {
        $match: {
          assignment: {$in: courseAssignmentsWhereUserIsMember},
        },
      },
      {
        $group: {
          _id: {
            assignee: '$assignee',
            assignment: '$assignment',
          },
          solutions: {$sum: 1},
          duration: {$sum: '$duration'},
          feedbacks: {$sum: {$cond: [{$gt: ['$feedback', null]}, 1, 0]}},
        },
      },
    ])) {
      const {_id: {assignment, assignee}, ...rest} = aggregateElement;
      let courseAssignee = assigneeMap.get(assignee);
      if (!courseAssignee) {
        courseAssignee = {
          assignee: assignee,
          assignments: Array(course.assignments.length).fill(null),
          solutions: 0,
          duration: 0,
          feedbacks: 0,
        };
        assigneeMap.set(assignee, courseAssignee);
      }
      const index = course.assignments.indexOf(assignment.toString());
      courseAssignee.assignments[index] = rest;
      courseAssignee.solutions += rest.solutions;
      courseAssignee.duration += rest.duration;
      courseAssignee.feedbacks += rest.feedbacks;
    }
    return Array.from(assigneeMap.values());
  }

  emit(event: string, course: CourseDocument) {
    this.eventService.emit(`courses.${course.id}.${event}`, course);
  }
}
