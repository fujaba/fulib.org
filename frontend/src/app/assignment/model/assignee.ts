export interface Assignee {
  assignment: string;
  solution: string;
  assignee: string;
  duration?: number;
}

export type UpdateAssigneeDto = Omit<Assignee, 'assignment' | 'solution'>;
export type PatchAssigneeDto = Partial<UpdateAssigneeDto>;
