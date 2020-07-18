import Solution from './solution';

export default class TaskGrading {
  solution: Solution;
  taskID: number;

  timeStamp?: Date;
  author: string;
  points: number;
  note: string;
}
