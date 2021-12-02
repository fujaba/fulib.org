export class SolutionStatistics {
  evaluated: {
    codeSearch: number;
    manual: number;
    total: number;
  };
  graded: number;
  total: number;
  pointsAvg: number;
}

export class EvaluationStatistics {
  codeSearch: number;
  manual: number;
  total: number;
}

export class TaskStatistics {
  task: string;
  totalPoints: number;
  totalCount: number;
}

export class AssignmentStatistics {
  solutions: SolutionStatistics;
  evaluations: EvaluationStatistics;
  tasks: TaskStatistics[];
}
