import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssigneeModule} from '../assignee/assignee.module';
import {SolutionModule} from '../solution/solution.module';
import {CourseController} from './course.controller';
import {Course, CourseSchema} from './course.schema';
import {CourseService} from './course.service';
import {CourseAuthGuard} from "./course-auth.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Course.name,
        schema: CourseSchema,
      },
    ]),
    SolutionModule,
    AssigneeModule,
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseAuthGuard,
  ],
  exports: [
    CourseService,
    CourseAuthGuard,
  ],
})
export class CourseModule {
}
