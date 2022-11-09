import Solution, {AuthorInfo} from './solution';

export default class Course {
  _id?: string;
  title: string;
  description: string;
  assignments: string[];
}

export interface SolutionInfo extends Required<Pick<Solution, '_id' | 'points'>> {
  assignee: string;
}

export interface CourseStudent {
  author: AuthorInfo;
  solutions: SolutionInfo[];
}
