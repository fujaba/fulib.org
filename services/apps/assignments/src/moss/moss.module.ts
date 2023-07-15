import {Module} from '@nestjs/common';
import {MossService} from './moss.service';
import {MossController} from './moss.controller';
import {AssignmentModule} from "../assignment/assignment.module";
import {SearchModule} from "../search/search.module";

@Module({
  imports: [AssignmentModule, SearchModule],
  providers: [MossService],
  controllers: [MossController]
})
export class MossModule {
}
