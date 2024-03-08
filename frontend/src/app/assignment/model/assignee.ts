import {IsIn, IsOptional} from "class-validator";
import {Presentation} from "@mean-stream/ngbx";

const OPTIONS = [1, 2, 3, 4];

export class Feedback {
  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How motivated are you to evaluate further solutions?',
    optionLabels: {
      1: 'Not motivated at all',
      2: 'Not very motivated',
      3: 'Rather motivated',
      4: 'Very motivated',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  motivation?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How exhausted do you feel after evaluating the previous solution(s)?',
    optionLabels: {
      1: 'Not exhausted at all',
      2: 'Not very exhausted',
      3: 'Rather exhausted',
      4: 'Very exhausted',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  exhaustion?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How stressed did you feel while evaluating the previous solution?',
    optionLabels: {
      1: 'Not stressed at all',
      2: 'Not very stressed',
      3: 'Rather stressed',
      4: 'Very stressed',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  stress?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How attentive are you currently when reviewing the solution?',
    optionLabels: {
      1: 'Not attentive at all',
      2: 'Not very attentive',
      3: 'Rather attentive',
      4: 'Very attentive',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  concentration?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How easy is it for you to ignore distractions currently?',
    optionLabels: {
      1: 'Not easy at all',
      2: 'Not very easy',
      3: 'Rather easy',
      4: 'Very easy',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  ignoreDistraction?: number;
}

export interface Assignee {
  assignment: string;
  solution: string;
  assignee: string;
  duration?: number;
  feedback?: Feedback;
  notes?: string;
}

export type UpdateAssigneeDto = Omit<Assignee, 'assignment' | 'solution'>;
export type BulkUpdateAssigneeDto = Omit<Assignee, 'assignment'>;
export type PatchAssigneeDto = Partial<UpdateAssigneeDto>;
