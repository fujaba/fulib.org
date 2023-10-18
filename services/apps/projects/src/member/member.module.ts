import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ProjectModule} from '../project/project.module';
import {MemberAuthGuard} from '@app/member';
import {MemberController} from './member.controller';
import {Member, MemberSchema} from '@app/member';
import {MemberService} from '@app/member';

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
