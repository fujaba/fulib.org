import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ProjectModule} from '../project/project.module';
import {MemberAuthGuard} from './member-auth.guard';
import {MemberController} from './member.controller';
import {Member, MemberSchema} from './member.schema';
import {MemberService} from './member.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Member.name,
        schema: MemberSchema,
      },
    ]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [MemberController],
  providers: [
    MemberService,
    MemberAuthGuard,
  ],
  exports: [
    MemberService,
    MemberAuthGuard,
  ],
})
export class MemberModule {
}
