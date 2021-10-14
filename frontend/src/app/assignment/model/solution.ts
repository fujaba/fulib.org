import TaskResult from './task-result';

export default class Solution {
  _id?: string;
  token?: string;
  assignment: string;

  createdBy?: string;
  author: {
    name: string;
    studentId: string;
    email: string;
  };
  solution: string;

  timestamp?: Date;
  results?: TaskResult[];
}
