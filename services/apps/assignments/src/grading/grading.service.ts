import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CreateEvaluationDto} from '../evaluation/evaluation.dto';
import {EvaluationService} from '../evaluation/evaluation.service';
import {Grading} from './grading.schema';

@Injectable()
export class GradingService implements OnModuleInit {
  constructor(
    @InjectModel(Grading.name) private model: Model<Grading>,
    private evaluationService: EvaluationService,
  ) {
  }

  async onModuleInit() {
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
    result.deletedCount && new Logger(GradingService.name).warn(`Migrated ${result.deletedCount} gradings`);
  }
}
