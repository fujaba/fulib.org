import {Module} from '@nestjs/common';
import {ProjectModule} from '../project/project.module';
import {ContainerController} from './container.controller';
import {ContainerService} from './container.service';

@Module({
  imports: [
    ProjectModule,
  ],
  controllers: [ContainerController],
  providers: [ContainerService],
})
export class ContainerModule {
}
