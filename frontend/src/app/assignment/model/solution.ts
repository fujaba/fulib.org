export class AuthorInfo {
  name: string;
  studentId: string;
  email: string;
  github: string;
}

export const authorInfoProperties = [
  ['Name', 'name'],
  ['Student ID', 'studentId'],
  ['E-Mail', 'email'],
  ['GitHub Username', 'github'],
] as const;

export default class Solution {
  _id?: string;
  token?: string;
  assignment: string;

  createdBy?: string;
  author: AuthorInfo;
  solution: string;
  commit?: string;
  consent?: {
    demonstration?: boolean;
    scientific?: boolean;
    '3P'?: boolean;
  };

  timestamp?: Date;
  points?: number;
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
