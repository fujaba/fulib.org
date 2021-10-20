import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {AssignmentService} from '../assignment/assignment.service';
import {CreateEvaluationDto} from '../evaluation/evaluation.dto';
import {EvaluationService} from '../evaluation/evaluation.service';
import {generateToken, idFilter} from '../utils';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument, TaskResult} from './solution.schema';

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel('solutions') private model: Model<Solution>,
    @InjectConnection() connection: Connection,
    private assignmentService: AssignmentService,
    private evaluationService: EvaluationService,
  ) {
    connection.on('connected', () => this.migrate());
  }

  async migrate() {
    let count = 0;
    for await (const solution of this.model.find({results: {$exists: true}})) {
      for (const result of solution.results!) {
        const {
          task,
          points,
          output,
        } = result;
        const dto: CreateEvaluationDto = {
          task,
          author: 'Autograding',
          remark: output,
          points,
          snippets: [],
        };
        count++;
        await this.evaluationService.create(solution.assignment, solution._id, dto);
      }
    }
    console.info('Migrated', count, 'results');

    const result = await this.model.updateMany({}, {
      $rename: {
        userId: 'createdBy',
        timeStamp: 'timestamp',
        name: 'author.name',
        email: 'author.email',
        studentID: 'author.studentId',
      },
      $unset: {
        results: 1,
      },
    });
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
    return assignment ? this.assignmentService.check(dto.solution, assignment) : [];
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

  bulkWrite(map: any) {
    return this.model.bulkWrite(map);
  }
}
