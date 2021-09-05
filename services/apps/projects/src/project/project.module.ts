import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {MemberModule} from '../member/member.module';
import {ProjectAuthGuard} from './project-auth.guard';
import {ProjectController} from './project.controller';
import {ProjectSchema} from './project.schema';
import {ProjectService} from './project.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'projects',
        schema: ProjectSchema,
      },
    ]),
    forwardRef(() => MemberModule),
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ProjectAuthGuard,
  ],
  exports: [
    ProjectService,
    ProjectAuthGuard,
  ],
})
export class ProjectModule {
}
