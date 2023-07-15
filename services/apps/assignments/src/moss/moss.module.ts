import {Module} from '@nestjs/common';
import {MossService} from './moss.service';
import {MossController} from './moss.controller';
import {AssignmentModule} from "../assignment/assignment.module";
import {SearchModule} from "../search/search.module";
import {SolutionModule} from "../solution/solution.module";

@Module({
  imports: [AssignmentModule, SolutionModule, SearchModule],
  providers: [MossService],
  controllers: [MossController]
})
export class MossModule {
}
