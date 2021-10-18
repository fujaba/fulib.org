import {UserToken} from '@app/keycloak-auth';
import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {environment} from '../environment';
import {TaskResult} from '../solution/solution.schema';
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

  async check(solution: string, {tasks}: Pick<Assignment, 'tasks'>): Promise<TaskResult[]> {
    return Promise.all(tasks.map(task => this.checkTask(solution, task)));
  }

  async checkTask(solution: string, task: Task): Promise<TaskResult> {
    const response = await this.http.post(`${environment.compiler.apiUrl}/runcodegen`, {
      privacy: 'none',
      packageName: 'org.fulib.assignments',
      scenarioFileName: 'Scenario.md',
      scenarioText: `# Solution\n\n${solution}\n\n## Verification\n\n${task.verification}\n\n`,
    }).toPromise();
    return {
      task: task._id,
      points: response?.data.exitCode === 0 ? task.points : 0,
      output: response?.data.output,
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
