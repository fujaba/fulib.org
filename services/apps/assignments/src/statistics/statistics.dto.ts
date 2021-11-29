export class SolutionStatistics {
  codeSearch: number;
  manual: number;
  graded: number;
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
