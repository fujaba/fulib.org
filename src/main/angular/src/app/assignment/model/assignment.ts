import Task from './task';

export default class Assignment {
  id?: string;
  token?: string;

  title: string;
  description: string;
  descriptionHtml?: string;
  userId?: string;
  author: string;
  email: string;
  deadline: Date | null;

  tasks: Task[];
  solution: string;
  templateSolution: string;

  static comparator = (a: Assignment, b: Assignment) => a.title.localeCompare(b.title) || a.id!.localeCompare(b.id!);
}
