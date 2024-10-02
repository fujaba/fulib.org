import Task from './task';

export interface ClassroomInfo {
  org?: string;
  prefix?: string;
  token?: string;
  webhook?: string;
  codeSearch?: boolean;
}

export interface MossConfig {
  userId?: number;
  language?: string;
  result?: string;
}

export interface OpenAIConfig {
  apiKey?: string;
  model?: string;
  consent?: boolean;
  ignore?: string;
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
  moss?: MossConfig;
  openAI?: OpenAIConfig;

  passingPoints?: number;
  tasks: Task[];
}

export type CreateAssignmentDto = Omit<Assignment, '_id' | 'token' | 'createdBy'>;

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {
  token?: true;
}

export type ReadAssignmentDto = Omit<Assignment, 'token' | 'solution'>;
