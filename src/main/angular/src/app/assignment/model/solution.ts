import Assignment from './assignment';
import TaskResult from './task-result';

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
