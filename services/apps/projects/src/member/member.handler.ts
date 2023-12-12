import {OnEvent} from "@nestjs/event-emitter";
import {Project} from "../project/project.schema";
import {Injectable} from "@nestjs/common";
import {MemberService} from "@app/member";

@Injectable()
export class MemberHandler {
  constructor(
    readonly memberService: MemberService,
  ) {
  }

  @OnEvent('projects.*.created')
  @OnEvent('projects.*.updated')
  async onProjectChanged(project: Project) {
    await this.memberService.upsert({parent: project._id, user: project.userId}, {});
  }

  @OnEvent('projects.*.deleted')
  async onProjectDeleted(project: Project) {
    await this.memberService.deleteMany({parent: project._id});
  }
}
