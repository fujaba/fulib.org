import {OnEvent} from "@nestjs/event-emitter";
import {Course} from "../course/course.schema";
import {Injectable} from "@nestjs/common";
import {MemberService} from "@app/member";

@Injectable()
export class CourseMemberHandler {
  constructor(
    readonly memberService: MemberService,
  ) {
  }

  @OnEvent('courses.*.created')
  @OnEvent('courses.*.updated')
  async onCourseChanged(course: Course) {
    await this.memberService.upsert({parent: course._id, user: course.createdBy}, {});
  }

  @OnEvent('courses.*.deleted')
  async onCourseDeleted(course: Course) {
    await this.memberService.deleteMany({parent: course._id});
  }
}
