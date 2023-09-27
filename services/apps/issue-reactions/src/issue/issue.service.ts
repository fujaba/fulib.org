import {Injectable} from '@nestjs/common';
import {Issue} from "./issue.schema";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {MongooseRepository} from "@mean-stream/nestx";

@Injectable()
export class IssueService extends MongooseRepository<Issue> {
  constructor(
    @InjectModel(Issue.name) readonly model: Model<Issue>,
  ) {
    super(model);
  }
}
