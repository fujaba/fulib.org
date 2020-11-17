import TaskResult from './task-result';
import Assignment from './assignment';
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
  results: TaskResult[];
}
