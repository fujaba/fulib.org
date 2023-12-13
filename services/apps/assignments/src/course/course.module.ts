import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssigneeModule} from '../assignee/assignee.module';
import {SolutionModule} from '../solution/solution.module';
import {CourseController} from './course.controller';
import {Course, CourseSchema} from './course.schema';
import {CourseService} from './course.service';
import {CourseMemberModule} from "../course-member/course-member.module";

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
    CourseMemberModule,
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
  ],
  exports: [
    CourseService,
  ],
})
export class CourseModule {
}
