import {EventService} from '@app/event';
import {UserToken} from '@app/keycloak-auth';
import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, UpdateQuery} from 'mongoose';
import {environment} from '../environment';
import {CreateEvaluationDto} from '../evaluation/evaluation.dto';
import {generateToken, idFilter} from '../utils';
import {CreateAssignmentDto, ReadAssignmentDto, ReadTaskDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment, AssignmentDocument, Task} from './assignment.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('assignments') private model: Model<Assignment>,
    private http: HttpService,
    private eventService: EventService,
  ) {
    this.migrate();
  }

  async migrate() {
    const result = await this.model.updateMany({}, {
      $rename: {
        userId: 'createdBy',
      },
      $unset: {
        descriptionHtml: 1,
      },
    });
    console.info('Migrated', result.modifiedCount, 'assignments');
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

  async check(solution: string, {tasks}: Pick<Assignment, 'tasks'>): Promise<CreateEvaluationDto[]> {
    const results = await Promise.all(tasks.map(task => this.checkTasksRecursively(solution, task)));
    return results.flatMap(x => x);
  }

  async checkTasksRecursively(solution: string, task: Task): Promise<CreateEvaluationDto[]> {
    const [first, rest] = await Promise.all([
      this.checkTask(solution, task),
      Promise.all(task.children.map(t => this.checkTasksRecursively(solution, t))),
    ]);
    const flatRest = rest.flatMap(x => x);
    return first ? [first, ...flatRest] : flatRest;
  }

  async checkTask(solution: string, task: Task): Promise<CreateEvaluationDto | undefined> {
    if (!task.verification) {
      return undefined;
    }
    const response = await this.http.post(`${environment.compiler.apiUrl}/runcodegen`, {
      privacy: 'none',
      packageName: 'org.fulib.assignments',
      scenarioFileName: 'Scenario.md',
      scenarioText: `# Solution\n\n${solution}\n\n## Verification\n\n${task.verification}\n\n`,
    }).toPromise();
    return {
      task: task._id,
      author: 'Autograding',
      remark: response?.data.output ?? '',
      points: response?.data.exitCode === 0 ? Math.max(task.points, 0) : Math.min(task.points, 0),
      snippets: [],
    };
  }

  async create(dto: CreateAssignmentDto, userId?: string): Promise<AssignmentDocument> {
    const token = generateToken();
    const created = await this.model.create({
      ...dto,
      token,
      createdBy: userId,
    });
    created && this.emit('created', created.id, created);
    return created;
  }

  async findAll(where: FilterQuery<Assignment> = {}): Promise<ReadAssignmentDto[]> {
    const assignments = await this.model.find(where).sort({title: 1}).exec();
    return assignments.map(a => this.mask(a.toObject()));
  }

  async findOne(id: string): Promise<AssignmentDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  mask(assignment: Assignment): ReadAssignmentDto {
    const {token, solution, tasks, ...rest} = assignment;
    return {
      ...rest,
      tasks: assignment.tasks.map(t => this.maskTask(t)),
    };
  }

  private maskTask(task: Task): ReadTaskDto {
    const {verification, note, children, ...rest} = task;
    return {
      ...rest,
      children: children.map(t => this.maskTask(t)),
    };
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment | null> {
    const {token, classroom, ...rest} = dto;
    const update: UpdateQuery<Assignment> = rest;
    if (token) {
      update.token = generateToken();
    }
    if (classroom) {
      // need to flatten the classroom object to prevent deleting the GitHub token all the time
      for (const [key, value] of Object.entries(classroom)) {
        if (key === 'token' && value === '***') {
          continue;
        }
        update[`classroom.${key}`] = value;
      }
    }
    const updated = await this.model.findOneAndUpdate(idFilter(id), update, {new: true}).exec();
    updated && this.emit('updated', id, updated);
    return updated;
  }

  async remove(id: string): Promise<AssignmentDocument | null> {
    const deleted = await this.model.findOneAndDelete(idFilter(id)).exec();
    deleted && this.emit('deleted', id, deleted);
    return deleted;
  }

  isAuthorized(assignment: Assignment, user?: UserToken, token?: string): boolean {
    return assignment.token === token || !!user && user.sub === assignment.createdBy;
  }

  private emit(event: string, id: string, assignment: Assignment) {
    const users = [assignment.token, assignment.createdBy].filter((i): i is string => !!i);
    this.eventService.emit(`assignment.${id}.${event}`, {event, data: assignment, users});
  }
}
