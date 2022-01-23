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
  timeAvg: number;
}

export class TimeStatistics {
  evaluationTotal: number;
  evaluationAvg: number;
  pointsAvg: number;
  codeSearchSavings: number;
}

export class AssignmentStatistics {
  solutions: SolutionStatistics;
  evaluations: EvaluationStatistics;
  weightedEvaluations: EvaluationStatistics;
  time: TimeStatistics;
  tasks: TaskStatistics[];
}
