export class Snippet {
  file: string;
  from: { line: number; character: number; };
  to: { line: number; character: number; };
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

  codeSearch?: CodeSearchInfo;
}

export interface CreateEvaluationDto extends Omit<Evaluation, '_id' | 'assignment' | 'solution' | 'createdAt' | 'createdBy' | 'updatedAt' | 'codeSearch'> {
  codeSearch?: boolean;
}

export type UpdateEvaluationDto = Partial<CreateEvaluationDto>;

export interface FilterEvaluationParams {
  task?: string;
  file?: string;
  codeSearch?: boolean;
  origin?: string;
}
