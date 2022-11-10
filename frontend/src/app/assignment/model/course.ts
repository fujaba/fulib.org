import Solution, {AuthorInfo} from './solution';

export default class Course {
  _id: string;
  createdBy?: string;
  title: string;
  description: string;
  assignments: string[];
}

export type CreateCourseDto = Omit<Course, '_id' | 'createdBy'>;
export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface SolutionInfo extends Required<Pick<Solution, '_id' | 'points'>> {
  assignee: string;
}

export interface CourseStudent {
  author: AuthorInfo;
  solutions: SolutionInfo[];
}
