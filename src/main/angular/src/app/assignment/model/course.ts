import Assignment from './assignment';

export default class Course {
  id?: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  assignmentIds?: string[];
  assignments?: Assignment[];
}
