import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {MulterModule} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {AssignmentModule} from '../assignment/assignment.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {SearchModule} from '../search/search.module';
import {SolutionModule} from '../solution/solution.module';
import {ClassroomController} from './classroom.controller';
import {ClassroomScheduler} from './classroom.scheduler';
import {ClassroomService} from './classroom.service';

@Module({
  imports: [
    SearchModule,
    AssignmentModule,
    SolutionModule,
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
  ],
  controllers: [ClassroomController],
})
export class ClassroomModule {
}
