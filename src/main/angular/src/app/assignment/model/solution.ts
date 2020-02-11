import Assignment from './assignment';
import TaskResult from './task-result';

export type CheckSolution = { assignment: Assignment, solution: string };
export type CheckResult = { results: TaskResult[] };

export default class Solution {
  id?: string;
  token?: string;
  assignment: Assignment;

  name: string;
  studentID: string;
  email: string;
  solution: string;

  timeStamp?: Date;
  results?: TaskResult[];

  assignee?: string;
}
