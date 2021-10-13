import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ProjectModule} from '../project/project.module';
import {MemberAuthGuard} from './member-auth.guard';
import {MemberController} from './member.controller';
import {MemberSchema} from './member.schema';
import {MemberService} from './member.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'members',
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
