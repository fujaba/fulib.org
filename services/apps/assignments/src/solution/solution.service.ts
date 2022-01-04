import {EventService} from '@app/event';
import {UserToken} from '@app/keycloak-auth';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {AssignmentService} from '../assignment/assignment.service';
import {CreateEvaluationDto} from '../evaluation/evaluation.dto';
import {Evaluation} from '../evaluation/evaluation.schema';
import {EvaluationService} from '../evaluation/evaluation.service';
import {generateToken, idFilter} from '../utils';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument} from './solution.schema';

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel('solutions') public model: Model<Solution>,
    private assignmentService: AssignmentService,
    private evaluationService: EvaluationService,
    private eventService: EventService,
  ) {
    this.migrate();
  }

  async migrate() {
    const solutions: Pick<SolutionDocument, 'assignment' | '_id' | 'results'>[] = await this.model
      .find({results: {$type: 4}})
      .select('assignment _id results')
      .exec();
    await Promise.all(solutions.map(async ({assignment, _id, results}) => {
      if (!results) {
        // TODO why does this even happen
        return;
      }
      await Promise.all(results.map(result => {
        const {
          task,
          output: remark,
          points,
        } = result;
        const dto: CreateEvaluationDto = {
          task,
          author: 'Autograding',
          remark,
          points,
          snippets: [],
        };
        return this.evaluationService.create(assignment, _id, dto);
      }));
    }));
    const count = solutions.reduce((a, c) => c.results ? a + c.results.length : a, 0);
    console.info('Migrated', count, 'results of', solutions.length, 'solutions');

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

  private async createEvaluation(solution: SolutionDocument, dto: CreateEvaluationDto): Promise<Evaluation> {
    return this.evaluationService.create(solution.assignment, solution._id, dto);
  }

  async create(assignment: string, dto: CreateSolutionDto, createdBy?: string): Promise<SolutionDocument> {
    const created = await this.model.create({
      ...dto,
      assignment,
      createdBy,
      token: generateToken(),
      timestamp: new Date(),
    });
    this.emit('created', created);
    return created;
  }

  async autoGrade(solution: SolutionDocument): Promise<void> {
    const assignment = await this.assignmentService.findOne(solution.assignment);
    if (!assignment) {
      return;
    }
    const results = await this.assignmentService.check(solution.solution, assignment);
    await Promise.all(results.map(r => this.createEvaluation(solution, r)));
  }

  async findAll(where: FilterQuery<Solution> = {}): Promise<ReadSolutionDto[]> {
    return this.model
      .find(where)
      .select(['-token'])
      .sort('author.name author.github timestamp')
      .collation({locale: 'en', caseFirst: 'off'})
      .exec();
  }

  async findOne(id: string): Promise<SolutionDocument | null> {
    return this.model.findOne(idFilter(id)).exec();
  }

  async update(id: string, dto: UpdateSolutionDto): Promise<SolutionDocument | null> {
    const updated = await this.model.findOneAndUpdate(idFilter(id), dto, {new: true}).exec();
    updated && this.emit('updated', updated);
    return updated;
  }

  async remove(id: string): Promise<SolutionDocument | null> {
    const deleted = await this.model.findOneAndDelete(idFilter(id)).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  isAuthorized(solution: Solution, user?: UserToken, token?: string): boolean {
    return solution.token === token || !!user && user.sub === solution.createdBy;
  }

  bulkWrite(map: any) {
    return this.model.bulkWrite(map);
  }

  private emit(event: string, solution: SolutionDocument) {
    this.eventService.emit(`solution.${solution.id}.${event}`, {event, data: solution});
  }
}
