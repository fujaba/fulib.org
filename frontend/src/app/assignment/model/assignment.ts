import Task from './task';

export interface ClassroomInfo {
  org?: string;
  prefix?: string;
  token?: string;
  webhook?: string;
  codeSearch?: boolean;
  mossId?: number;
  mossLanguage?: string;
  mossResult?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  openaiConsent?: boolean;
  openaiIgnore?: string;
}

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

  classroom?: ClassroomInfo;

  passingPoints?: number;
  tasks: Task[];
}

export type CreateAssignmentDto = Omit<Assignment, '_id' | 'token' | 'createdBy'>;

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {
  token?: true;
}

export type ReadAssignmentDto = Omit<Assignment, 'token' | 'solution'>;
