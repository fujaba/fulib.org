import { Module } from '@nestjs/common';
import { ReactionHandlerService } from './reaction-handler.service';
import {ScheduleModule} from "@nestjs/schedule";
import {IssueModule} from "../issue/issue.module";

@Module({
  imports: [ScheduleModule, IssueModule],
  providers: [ReactionHandlerService]
})
export class ReactionHandlerModule {}
