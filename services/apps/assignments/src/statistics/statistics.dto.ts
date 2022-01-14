export class SolutionStatistics {
  evaluated: number;
  graded: number;
  total: number;
  pointsAvg: number;
}

export class EvaluationStatistics {
  codeSearch: number;
  editedCodeSearch: number;
  manual: number;
  total: number;
}

export class TaskStatistics {
  task: string;
  points: EvaluationStatistics;
  count: EvaluationStatistics;
}

export class AssignmentStatistics {
  solutions: SolutionStatistics;
  evaluations: EvaluationStatistics;
  tasks: TaskStatistics[];
}
