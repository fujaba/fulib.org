import {Module} from '@nestjs/common';
import {CommentPosterService} from './comment-poster.service';
import {ScheduleModule} from "@nestjs/schedule";
import {IssueModule} from "../issue/issue.module";

@Module({
  imports: [ScheduleModule, IssueModule],
  providers: [CommentPosterService]
})
export class CommentPosterModule {
}
