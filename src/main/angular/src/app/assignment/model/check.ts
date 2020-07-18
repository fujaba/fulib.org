import TaskResult from './task-result';
import Assignment from './assignment';
import Task from './task';

export type CheckSolution = {
  assignment: Assignment;
  solution: string;
};

export type CheckAssignment = {
  tasks: Task[];
  solution: string;
};

export type CheckResult = {
  results: TaskResult[];
}
