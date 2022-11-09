import Solution, {AuthorInfo} from './solution';

export default class Course {
  _id?: string;
  title: string;
  description: string;
  assignments: string[];
}

export type SolutionInfo = Required<Pick<Solution, '_id' | 'points'>>;

export interface CourseStudent {
  author: AuthorInfo;
  solutions: SolutionInfo[];
}
