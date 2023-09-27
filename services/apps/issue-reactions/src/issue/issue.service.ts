import {Injectable} from '@nestjs/common';
import {Issue} from "./issue.schema";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {EventRepository, EventService, MongooseRepository} from "@mean-stream/nestx";

@Injectable()
@EventRepository()
export class IssueService extends MongooseRepository<Issue> {
  constructor(
    @InjectModel(Issue.name) readonly model: Model<Issue>,
    readonly eventService: EventService,
  ) {
    super(model);
  }

  emit(event: string, issue: Issue) {
    this.eventService.emit(`assignments.${issue.assignment}.solutions.${issue.solution}.issues.${issue.id}.${event}`, issue);
  }
}
