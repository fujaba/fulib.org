import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Member, MemberAuthGuard, MemberSchema, MemberService} from '@app/member';
import {AssignmentMemberController} from './assignment-member.controller';
import {AssignmentMemberHandler} from "./assignment-member.handler";
import {AssignmentModule} from "../assignment/assignment.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Member.name, schema: MemberSchema}]),
    forwardRef(() => AssignmentModule),
  ],
  controllers: [AssignmentMemberController],
  providers: [
    MemberService,
    MemberAuthGuard,
    AssignmentMemberHandler,
  ],
  exports: [
    MemberService,
    MemberAuthGuard,
  ],
})
export class AssignmentMemberModule {
}
