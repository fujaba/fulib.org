import {EventService} from '@mean-stream/nestx';
import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, Types, UpdateQuery} from 'mongoose';
import {generateToken} from '../utils';
import {CreateAssignmentDto, ReadAssignmentDto, ReadTaskDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment, AssignmentDocument, Task} from './assignment.schema';
import {MemberService} from "@app/member";

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name) private model: Model<Assignment>,
    private eventService: EventService,
    private readonly memberService: MemberService,
  ) {
  }

  findTask(tasks: Task[], id: string): Task | undefined {
    for (const task of tasks) {
      if (task._id == id) {
        return task;
      }
      const subTask = this.findTask(task.children, id);
      if (subTask) {
        return subTask;
      }
    }
    return undefined;
  }

  async create(dto: CreateAssignmentDto, userId?: string): Promise<AssignmentDocument> {
    const token = generateToken();
    const created = await this.model.create({
      ...dto,
      token,
      createdBy: userId,
    });
    created && this.emit('created', created);
    return created;
  }

  async findAll(where: FilterQuery<Assignment> = {}): Promise<AssignmentDocument[]> {
    return this.model.find(where).sort({title: 1}).collation({
      locale: 'en',
      numericOrdering: true,
    }).exec();
  }

  async findOne(id: string | Types.ObjectId): Promise<AssignmentDocument | null> {
    return this.model.findById(id).exec();
  }

  mask(assignment: Assignment): ReadAssignmentDto {
    const {token, tasks, classroom, ...rest} = assignment;
    return {
      ...rest,
      tasks: assignment.tasks.map(t => this.maskTask(t)),
    };
  }

  private maskTask(task: Task): ReadTaskDto {
    const {note, children, ...rest} = task;
    return {
      ...rest,
      children: children?.map(t => this.maskTask(t)),
    };
  }

  async update(id: string, dto: UpdateAssignmentDto | UpdateQuery<Assignment>): Promise<Assignment | null> {
    const {token, classroom, ...rest} = dto;
    const update: UpdateQuery<Assignment> = rest;
    if (token) {
      update.token = generateToken();
    }
    if (classroom) {
      // need to flatten the classroom object to prevent deleting the GitHub token all the time
      for (const [key, value] of Object.entries(classroom)) {
        update[`classroom.${key}`] = value;
      }
    }
    const updated = await this.model.findByIdAndUpdate(id, update, {new: true}).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async remove(id: string): Promise<AssignmentDocument | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  async isAuthorized(assignment: Assignment, user?: UserToken, token?: string): Promise<boolean> {
    if (assignment.token === token) {
      return true;
    }
    if (!user) {
      return false;
    }
    return user.sub === assignment.createdBy
      || !!await this.memberService.findOne({parent: assignment._id, user: user.sub});
  }

  private emit(event: string, assignment: AssignmentDocument) {
    const users = [assignment.token, assignment.createdBy].filter((i): i is string => !!i);
    this.eventService.emit(`assignments.${assignment._id}.${event}`, assignment, users);
  }
}
