import Task from './task';

export default class Assignment {
  id: string;
  token: string;

  title: string;
  description: string;
  descriptionHtml: string;
  author: string;
  email: string;
  deadline: Date;

  tasks: Task[];
  solution: string;
}
