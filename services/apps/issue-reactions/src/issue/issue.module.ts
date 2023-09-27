import {Module} from '@nestjs/common';
import {IssueService} from './issue.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Issue, IssueSchema} from "./issue.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: Issue.name, schema: IssueSchema}]),
  ],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {
}
