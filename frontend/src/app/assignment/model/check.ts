import {ReadAssignmentDto} from './assignment';
import {CreateEvaluationDto, Evaluation} from './evaluation';
import Task from './task';

export interface CheckSolution {
  assignment: ReadAssignmentDto;
  solution: string;
}

export interface CheckAssignment {
  tasks: Task[];
  solution: string;
}

export interface CheckResult {
  results: (Evaluation | CreateEvaluationDto)[];
}
