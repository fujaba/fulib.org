export class Snippet {
  file: string;
  from: { line: number; };
  to: { line: number; };
  comment: string;
  code: string;
  context?: string;
}

export interface CodeSearchInfo {
  origin?: string;
  created?: number;
  updated?: number;
  deleted?: number;
}

export class Evaluation {
  assignment: string;
  solution: string;
  task: string;
  _id: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  author: string;
  remark: string;
  points: number;
  snippets: Snippet[];

  codeSeach?: CodeSearchInfo;
}

export type CreateEvaluationDto = Omit<Evaluation, '_id' | 'assignment' | 'solution' | 'createdAt' | 'createdBy' | 'updatedAt'>;

export type UpdateEvaluationDto = Partial<CreateEvaluationDto>;
