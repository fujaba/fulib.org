import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssigneeModule} from '../assignee/assignee.module';
import {CourseMemberModule} from '../course-member/course-member.module';
import {SolutionModule} from '../solution/solution.module';
import {CourseController} from './course.controller';
import {Course, CourseSchema} from './course.schema';
import {CourseService} from './course.service';

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
    forwardRef(() => CourseMemberModule),
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
