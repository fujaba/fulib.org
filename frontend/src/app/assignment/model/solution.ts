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
}

export class Feedback {
  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie angemessen empfindest du die Bewertung?',
    optionLabels: {
      1: 'Gar nicht angemessen',
      2: 'Eher nicht angemessen',
      3: 'Eher angemessen',
      4: 'Sehr angemessen',
    },
  })
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  appropriate?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Hast Du die Erklärungen zur Bewertung als hilfreich empfunden?',
    optionLabels: {
      1: 'Gar nicht hilfreich',
      2: 'Eher nicht hilfreich',
      3: 'Eher hilfreich',
      4: 'Sehr hilfreich',
    },
  })
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  helpful?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie sehr fördert das Feedback dein Verständnis, wie eine richtige Lösung aussehen könnte und wie du diese erreichen kannst?',
    optionLabels: {
      1: 'Gar nicht förderlich',
      2: 'Eher nicht förderlich',
      3: 'Eher förderlich',
      4: 'Sehr förderlich',
    },
  })
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  understandable?: number;
}
