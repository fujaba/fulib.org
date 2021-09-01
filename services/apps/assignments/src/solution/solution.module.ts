import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionController} from './solution.controller';
import {SolutionSchema} from './solution.schema';
import {SolutionService} from './solution.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'solutions',
        schema: SolutionSchema,
      },
    ]),
    AssignmentModule,
  ],
  controllers: [SolutionController],
  providers: [SolutionService],
})
export class SolutionModule {
}
