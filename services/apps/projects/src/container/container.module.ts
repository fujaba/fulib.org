import {Module} from '@nestjs/common';
import {MemberModule} from '../member/member.module';
import {ProjectModule} from '../project/project.module';
import {ContainerController} from './container.controller';
import {ContainerService} from './container.service';

@Module({
  imports: [
    ProjectModule,
    MemberModule,
  ],
  controllers: [ContainerController],
  providers: [ContainerService],
})
export class ContainerModule {
}
