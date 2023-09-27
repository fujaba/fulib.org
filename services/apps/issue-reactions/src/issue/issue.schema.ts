import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Doc} from "@mean-stream/nestx";
import {Types} from "mongoose";

@Schema()
export class Issue {
  _id: Types.ObjectId;

  @Prop()
  assignment: string;

  @Prop()
  solution: string;

  @Prop()
  id: number;

  @Prop()
  url: string;

  @Prop()
  comment?: number;

  @Prop({type: Object})
  reactions?: Record<string, {
    createdAt: Date;
    user?: string;
  }>;
}

export type IssueDocument = Doc<Issue>;
export const IssueSchema = SchemaFactory.createForClass(Issue);
