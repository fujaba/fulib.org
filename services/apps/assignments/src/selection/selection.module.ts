import {Module} from '@nestjs/common';
import {AssignmentModule} from '../assignment/assignment.module';
import {SelectionController} from './selection.controller';
import {SelectionService} from './selection.service';

@Module({
  imports: [
    AssignmentModule,
  ],
  controllers: [SelectionController],
  providers: [SelectionService],
})
export class SelectionModule {
}
