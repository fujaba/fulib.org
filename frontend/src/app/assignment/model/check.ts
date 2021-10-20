import Assignment from './assignment';
import {CreateEvaluationDto} from './evaluation';
import Task from './task';

export interface CheckSolution {
  assignment: Assignment;
  solution: string;
}

export interface CheckAssignment {
  tasks: Task[];
  solution: string;
}

export interface CheckResult {
  results: CreateEvaluationDto[];
}
