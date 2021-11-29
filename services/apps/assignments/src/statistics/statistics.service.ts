import {Injectable} from '@nestjs/common';
import {AssignmentService} from '../assignment/assignment.service';
import {EvaluationService} from '../evaluation/evaluation.service';
import {SolutionService} from '../solution/solution.service';
import {AssignmentStatistics, TaskStatistics} from './statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private evaluationService: EvaluationService,
  ) {
  }

  async getAssignmentStatistics(assignment: string): Promise<AssignmentStatistics> {
    const evaluations = await this.evaluationService.findAll({assignment});

    const solutions = new Set<string>();
    const codeSearchSolutions = new Set<string>();
    const tasks = new Map<string, TaskStatistics>();
    let codeSearchEvaluations = 0;
    for await (let {
      codeSearch,
      points,
      solution,
      task,
    } of this.evaluationService.model.find({assignment}).select('solution task points codeSearch')) {
      solutions.add(solution);

      if (codeSearch?.origin) {
        codeSearchEvaluations++;
        codeSearchSolutions.add(solution);
      }

      let item = tasks.get(task);
      if (!item) {
        item = {
          task,
          totalPoints: 0,
          totalCount: 0,
        };
        tasks.set(task, item);
      }

      item.totalPoints += points;
      item.totalCount++;
    }

    return {
      solutions: {
        codeSearch: codeSearchSolutions.size,
        manual: solutions.size - codeSearchSolutions.size,
        graded: solutions.size,
      },
      evaluations: {
        codeSearch: codeSearchEvaluations,
        manual: evaluations.length - codeSearchEvaluations,
        total: evaluations.length,
      },
      tasks: Array.from(tasks.values()).sort((a, b) => b.totalPoints - a.totalPoints),
    };
  }
}
