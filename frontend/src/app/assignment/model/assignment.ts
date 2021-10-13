import Task from './task';

export default class Assignment {
  _id?: string;
  token?: string;

  title: string;
  description: string;
  descriptionHtml?: string;
  createdBy?: string;
  author: string;
  email: string;
  deadline?: Date;

  tasks: Task[];
  solution: string;
  templateSolution: string;

  static comparator = (a: Assignment, b: Assignment) => a.title.localeCompare(b.title) || a._id!.localeCompare(b._id!);
}
