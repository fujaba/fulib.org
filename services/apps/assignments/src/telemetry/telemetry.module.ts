import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionModule} from '../solution/solution.module';
import {TelemetryController} from './telemetry.controller';
import {TelemetrySchema} from './telemetry.schema';
import {TelemetryService} from './telemetry.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'telemetry',
      schema: TelemetrySchema,
    }]),
    AssignmentModule,
    SolutionModule,
  ],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
  ],
  exports: [
    TelemetryService,
  ],
})
export class TelemetryModule {
}
