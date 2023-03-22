import Task from './task';

export default class Assignment {
  _id: string;
  archived?: boolean;
  token: string;

  title: string;
  description: string;
  createdBy?: string;
  author: string;
  email: string;
  issuance?: Date | string;
  deadline?: Date | string;

  classroom?: {
    org?: string;
    prefix?: string;
    token?: string;
    webhook?: string;
    codeSearch?: boolean;
    mossResult?: string;
  };

  tasks: Task[];
  solution: string;
  templateSolution: string;
}

export type CreateAssignmentDto = Omit<Assignment, '_id' | 'token' | 'createdBy'>;

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {
  token?: true;
}

export type ReadAssignmentDto = Omit<Assignment, 'token' | 'solution'>;
