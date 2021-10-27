import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, Model} from 'mongoose';
import {CreateEvaluationDto} from '../evaluation/evaluation.dto';
import {EvaluationService} from '../evaluation/evaluation.service';
import {Grading} from './grading.schema';

@Injectable()
export class GradingService {
  constructor(
    @InjectModel('gradings') private model: Model<Grading>,
    @InjectConnection() connection: Connection,
    private evaluationService: EvaluationService,
  ) {
    connection.once('connected', () => this.migrate());
  }

  async migrate() {
    for await (const grading of this.model.find()) {
      const {
        assignment,
        solution,
        task,
        createdBy,
        author,
        points,
        note,
      } = grading;
      const evaluation: CreateEvaluationDto = {
        task,
        author,
        remark: note,
        points,
        snippets: [],
      };
      await this.evaluationService.create(assignment, solution, evaluation, createdBy);
    }
    const result = await this.model.deleteMany();
    console.info('Migrated', result.deletedCount, 'gradings');
  }
}
