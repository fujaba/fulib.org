import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Member, MemberAuthGuard, MemberSchema, MemberService} from '@app/member';
import {CourseMemberController} from './course-member.controller';
import {CourseMemberHandler} from "./course-member.handler";
import {CourseModule} from "../course/course.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Member.name, schema: MemberSchema}]),
    forwardRef(() => CourseModule),
  ],
  controllers: [CourseMemberController],
  providers: [
    MemberService,
    MemberAuthGuard,
    CourseMemberHandler,
  ],
  exports: [
    MemberService,
    MemberAuthGuard,
  ],
})
export class CourseMemberModule {
}
