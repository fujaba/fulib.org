import {UserToken} from '@app/keycloak-auth';
import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {Task} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {environment} from '../environment';
import {generateToken, idFilter} from '../utils';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument, TaskResult} from './solution.schema';

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel('solutions') private model: Model<Solution>,
    @InjectConnection() private connection: Connection,
    private assignmentService: AssignmentService,
    private http: HttpService,
  ) {
    this.migrate();
  }

  async migrate() {
    const solutions = this.connection.collection('solutions');
    const result = await solutions.updateMany({}, {$rename: {
      userId: 'createdBy',
      timeStamp: 'timestamp',
    }});
    console.info('Migrated', result.modifiedCount, 'solutions');
  }

  async create(assignment: string, dto: CreateSolutionDto, createdBy?: string): Promise<SolutionDocument> {
    return this.model.create({
      ...dto,
      assignment,
      createdBy,
      token: generateToken(),
      timestamp: new Date(),
      results: await this.results(assignment, dto),
    });
  }

  private async results(assignmentId: string, dto: CreateSolutionDto): Promise<TaskResult[]> {
    const assignment = await this.assignmentService.findOne(assignmentId);
    return assignment ? Promise.all(assignment.tasks.map(t => this.taskResult(dto, t))) : [];
  }

  private async taskResult(dto: CreateSolutionDto, task: Task): Promise<TaskResult> {
    const response = await this.http.post(`${environment.compiler.apiUrl}/runcodegen`, {
      privacy: 'none',
      packageName: 'org.fulib.assignments',
      scenarioFileName: 'Scenario.md',
      scenarioText: `# Solution\n\n${dto.solution}\n\n## Verification\n\n${task.verification}\n\n`,
    }).toPromise();
    console.debug(response?.data);
    return {
      points: response?.data.exitCode === 0 ? task.points : 0,
      output: response?.data.output,
    };
  }

  async findAll(where: FilterQuery<Solution> = {}): Promise<ReadSolutionDto[]> {
    return this.model.find(where).select(['-token']).sort('+name +timestamp').exec();
  }

  async findOne(id: string): Promise<SolutionDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  mask(solution: Solution): ReadSolutionDto {
    const {token, ...rest} = solution;
    return rest;
  }

  async update(id: string, dto: UpdateSolutionDto): Promise<Solution | null> {
    return this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
  }

  async remove(id: string): Promise<SolutionDocument | null> {
    return this.model.findOneAndDelete(idFilter(id)).exec();
  }

  isAuthorized(solution: Solution, user?: UserToken, token?: string): boolean {
    return solution.token === token || !!user && user.sub === solution.createdBy;
  }
}
