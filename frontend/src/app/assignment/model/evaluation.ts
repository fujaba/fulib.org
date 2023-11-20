import {Config} from "./config";

export class Snippet {
  file: string;
  from: { line: number; character: number; };
  to: { line: number; character: number; };
  comment: string;
  code: string;
  context?: string;
  pattern?: string;
  score?: number;
}

export interface CodeSearchInfo {
  origin?: string;
  created?: number;
  updated?: number;
  deleted?: number;
}

export interface SimilarityInfo {
  origin: string;
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
  duration?: number;
  snippets: Snippet[];

  codeSearch?: CodeSearchInfo;
  similarity?: SimilarityInfo;
}

// TODO Remove this after the Winter Term 2023/24 study is over
export function isVisible(evaluation: Evaluation, config: Pick<Config, 'codeSearch' | 'similarSolutions'>) {
  if (!config.codeSearch && evaluation.author === 'Code Search') {
    return false;
  }
  if (!config.similarSolutions && evaluation.similarity?.origin && evaluation.createdAt === evaluation.updatedAt) {
    return false;
  }
  return true;
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

export interface RemarkDto extends Pick<Evaluation, 'remark' | 'points'> {
  count: number;
}
