import {OnEvent} from "@nestjs/event-emitter";
import {Assignment} from "../assignment/assignment.schema";
import {Injectable} from "@nestjs/common";
import {MemberService} from "@app/member";

@Injectable()
export class MemberHandler {
  constructor(
    readonly memberService: MemberService,
  ) {
  }

  @OnEvent('assignments.*.created')
  @OnEvent('assignments.*.updated')
  async onAssignmentChanged(assignment: Assignment) {
    await this.memberService.upsert({parent: assignment._id, user: assignment.createdBy}, {});
  }

  @OnEvent('assignments.*.deleted')
  async onAssignmentDeleted(assignment: Assignment) {
    await this.memberService.deleteMany({parent: assignment._id});
  }
}
