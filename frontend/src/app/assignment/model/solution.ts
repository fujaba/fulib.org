export class AuthorInfo {
  name: string;
  studentId: string;
  email: string;
  github: string;
}

export default class Solution {
  _id?: string;
  token?: string;
  assignment: string;

  createdBy?: string;
  author: AuthorInfo;
  solution: string;
  commit?: string;

  timestamp?: Date;
  points?: number;
}
