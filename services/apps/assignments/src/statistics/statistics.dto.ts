import {ApiProperty} from '@nestjs/swagger';

export class SolutionStatistics {
  @ApiProperty()
  evaluated: number;

  @ApiProperty()
  graded: number;

  @ApiProperty()
  passed: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  pointsAvg: number;
}

export class EvaluationStatistics {
  @ApiProperty()
  codeSearch: number;

  @ApiProperty()
  editedCodeSearch: number;

  @ApiProperty()
  manual: number;

  @ApiProperty()
  total: number;
}

export class TaskStatistics {
  @ApiProperty()
  task: string;

  @ApiProperty()
  points: EvaluationStatistics;

  @ApiProperty()
  count: EvaluationStatistics;

  @ApiProperty()
  timeAvg: number;
}

export class TimeStatistics {
  @ApiProperty()
  evaluationTotal: number;

  @ApiProperty()
  evaluationAvg: number;

  @ApiProperty()
  pointsAvg: number;

  @ApiProperty()
  codeSearchSavings: number;
}

export class AssignmentStatistics {
  @ApiProperty()
  solutions: SolutionStatistics;

  @ApiProperty()
  evaluations: EvaluationStatistics;

  @ApiProperty()
  weightedEvaluations: EvaluationStatistics;

  @ApiProperty()
  comments: number;

  @ApiProperty()
  time: TimeStatistics;

  @ApiProperty({type: [TaskStatistics]})
  tasks: TaskStatistics[];
}
