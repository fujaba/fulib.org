import {Module} from '@nestjs/common';
import {IssueFinderService} from './issue-finder.service';
import {ScheduleModule} from "@nestjs/schedule";
import {IssueModule} from "../issue/issue.module";

@Module({
  imports: [ScheduleModule, IssueModule],
  providers: [IssueFinderService],
})
export class IssueFinderModule {
}
