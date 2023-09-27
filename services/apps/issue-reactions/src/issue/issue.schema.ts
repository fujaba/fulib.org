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
