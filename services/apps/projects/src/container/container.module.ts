import {Module} from '@nestjs/common';
import {MemberModule} from '../member/member.module';
import {ProjectModule} from '../project/project.module';
import {ContainerController} from './container.controller';
import {ContainerService} from './container.service';
import {HttpModule} from "@nestjs/axios";

@Module({
  imports: [
    ProjectModule,
    MemberModule,
    HttpModule
  ],
  controllers: [ContainerController],
  providers: [ContainerService],
})
export class ContainerModule {
}
