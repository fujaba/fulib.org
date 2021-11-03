import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {ElasticsearchModule} from '@nestjs/elasticsearch';
import {environment} from '../environment';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {AssignmentModule} from '../assignment/assignment.module';
import {GradingModule} from '../grading/grading.module';
import {SolutionModule} from '../solution/solution.module';
import {ClassroomController} from './classroom.controller';
import {ClassroomScheduler} from './classroom.scheduler';
import {ClassroomService} from './classroom.service';

@Module({
  imports: [
    ElasticsearchModule.register(environment.elasticsearch),
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
