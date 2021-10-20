import {UserToken} from '@app/keycloak-auth';
import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {environment} from '../environment';
import {CreateEvaluationDto} from '../evaluation/evaluation.dto';
import {generateToken, idFilter} from '../utils';
import {CreateAssignmentDto, ReadAssignmentDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment, AssignmentDocument, Task} from './assignment.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('assignments') private model: Model<Assignment>,
    @InjectConnection() private connection: Connection,
    private http: HttpService,
  ) {
    this.migrate();
  }

  async migrate() {
    const collection = this.connection.collection('assignments');
    const result = await collection.updateMany({}, {
      $rename: {
        userId: 'createdBy',
      },
      $unset: {
        descriptionHtml: 1,
      },
    });
    console.info('Migrated', result.modifiedCount, 'assignments');
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
      points: response?.data.exitCode === 0 ? task.points : 0,
      snippets: [],
    };
  }

  async create(dto: CreateAssignmentDto, userId?: string): Promise<AssignmentDocument> {
    const token = generateToken();
    return this.model.create({
      ...dto,
      token,
      createdBy: userId,
    });
  }

  async findAll(where: FilterQuery<Assignment> = {}): Promise<ReadAssignmentDto[]> {
    return this.model.find(where).select(['-token', '-solution', '-tasks.verification']).exec();
  }

  async findOne(id: string): Promise<AssignmentDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  mask(assignment: Assignment): ReadAssignmentDto {
    const {token, solution, tasks, ...rest} = assignment;
    return {
      ...rest,
      tasks: assignment.tasks.map(({verification, ...rest}) => rest),
    } as ReadAssignmentDto;
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment | null> {
    return this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
  }

  async remove(id: string): Promise<AssignmentDocument | null> {
    return this.model.findOneAndDelete(idFilter(id)).exec();
  }

  isAuthorized(assignment: Assignment, user?: UserToken, token?: string): boolean {
    return assignment.token === token || !!user && user.sub === assignment.createdBy;
  }
}
