import {IsIn, IsOptional} from "class-validator";
import {Presentation} from "@mean-stream/ngbx";

export class AuthorInfo {
  name?: string;
  studentId?: string;
  email?: string;
  github?: string;
}

export const authorInfoProperties = [
  ['Name', 'name'],
  ['Student ID', 'studentId'],
  ['E-Mail', 'email'],
  ['GitHub Username', 'github'],
] as const;

export interface Consent {
  demonstration?: boolean;
  scientific?: boolean;
  '3P'?: boolean;
}

export const consentKeys = ['demonstration', 'scientific', '3P'] as const;

export default class Solution {
  _id?: string;
  token?: string;
  assignment: string;

  createdBy?: string;
  author: AuthorInfo;
  commit?: string;
  consent?: Consent;

  timestamp?: string;
  points?: number;
  feedback?: Feedback;
}

export type CreateSolutionDto = Pick<Solution, 'author'>;

export enum SolutionStatus {
  todo = 'todo',
  codeSearch = 'code-search',
  started = 'started',
  graded = 'graded',
}

export interface RichSolutionDto extends Solution {
  assignee?: string;
  status: SolutionStatus;
}

export type ImportSolution = Pick<Solution,
  | '_id'
  | 'assignment'
  | 'timestamp'
  | 'commit'
  | 'author'
>;

export interface EstimatedCosts {
  solutions: number;
  files: number;
  tokens: number;
  estimatedCost: number;
  functions: string[];
  ignoredFiles: string[];
  ignoredFunctions: string[];
}

export class Feedback {
  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How appropriate was the evaluation?',
    optionLabels: {
      1: 'Not appropriate at all',
      2: 'Not very appropriate',
      3: 'Rather appropriate',
      4: 'Very appropriate',
    },
  })
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  appropriate?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Did you find the explanations of your evaluation helpful?',
    optionLabels: {
      1: 'Not helpful at all',
      2: 'Not very helpful',
      3: 'Rather helpful',
      4: 'Very helpful',
    },
  })
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  helpful?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'How much does the evaluation help you understand what a correct solution might look like and how to achieve it?',
    optionLabels: {
      1: 'Not understandable at all',
      2: 'Not very understandable',
      3: 'Rather understandable',
      4: 'Very understandable',
    },
  })
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  understandable?: number;
}
