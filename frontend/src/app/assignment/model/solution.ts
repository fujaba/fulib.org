import TaskResult from './task-result';

export default class Solution {
  _id?: string;
  token?: string;
  assignment: string;

  createdBy?: string;
  name: string;
  studentID: string;
  email: string;
  solution: string;

  timestamp?: Date;
  results?: TaskResult[];
}
