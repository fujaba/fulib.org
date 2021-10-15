import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {AssignmentModule} from '../assignment/assignment.module';
import {GradingModule} from '../grading/grading.module';
import {SolutionModule} from '../solution/solution.module';
import {ClassroomController} from './classroom.controller';
import {ClassroomService} from './classroom.service';

@Module({
  imports: [
    AssignmentModule,
    SolutionModule,
    GradingModule,
    HttpModule,
  ],
  providers: [ClassroomService],
  controllers: [ClassroomController],
})
export class ClassroomModule {
}
