import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {MulterModule} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {AssignmentModule} from '../assignment/assignment.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {GradingModule} from '../grading/grading.module';
import {SearchModule} from '../search/search.module';
import {SolutionModule} from '../solution/solution.module';
import {ClassroomController} from './classroom.controller';
import {ClassroomScheduler} from './classroom.scheduler';
import {ClassroomService} from './classroom.service';
import {MossService} from './moss.service';

@Module({
  imports: [
    SearchModule,
    AssignmentModule,
    SolutionModule,
    GradingModule,
    EvaluationModule,
    HttpModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './data/upload',
      }),
    }),
  ],
  providers: [
    ClassroomService,
    ClassroomScheduler,
    MossService,
  ],
  controllers: [ClassroomController],
})
export class ClassroomModule {
}
