import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Doc} from "@mean-stream/nestx";

@Schema()
export class Issue {
  @Prop()
  assignment: string;

  @Prop()
  solution: string;

  @Prop()
  id: number;
}

export type IssueDocument = Doc<Issue>;
export const IssueSchema = SchemaFactory.createForClass(Issue);
