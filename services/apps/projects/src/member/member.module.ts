import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Member, MemberAuthGuard, MemberSchema, MemberService} from '@app/member';
import {MemberController} from './member.controller';
import {MemberHandler} from "./member.handler";
import {ProjectModule} from "../project/project.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Member.name, schema: MemberSchema}]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [MemberController],
  providers: [
    MemberService,
    MemberAuthGuard,
    MemberHandler,
  ],
  exports: [
    MemberService,
    MemberAuthGuard,
  ],
})
export class MemberModule {
}
