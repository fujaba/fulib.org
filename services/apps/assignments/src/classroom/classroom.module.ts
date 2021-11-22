import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {AssignmentModule} from '../assignment/assignment.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {GradingModule} from '../grading/grading.module';
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
    GradingModule,
    EvaluationModule,
    HttpModule,
  ],
  providers: [
    ClassroomService,
    ClassroomScheduler,
  ],
  controllers: [ClassroomController],
})
export class ClassroomModule {
}
