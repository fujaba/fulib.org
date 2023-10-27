import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Member, MemberSchema, MemberService} from '@app/member';
import {CourseMemberController} from './course-member.controller';
import {CourseMemberHandler} from "./course-member.handler";
import {CourseModule} from "../course/course.module";
import {CourseAuthGuard} from "./course-auth.guard";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Member.name, schema: MemberSchema}]),
    forwardRef(() => CourseModule),
  ],
  controllers: [CourseMemberController],
  providers: [
    MemberService,
    CourseAuthGuard,
    CourseMemberHandler,
  ],
  exports: [
    MemberService,
    CourseAuthGuard,
  ],
})
export class CourseMemberModule {
}
