import {AuthorInfo} from './solution';

export default class Course {
  _id?: string;
  title: string;
  description: string;
  assignments: string[];
}

export interface CourseStudent {
  author: AuthorInfo;
  points: number[];
  solutions: string[];
}
