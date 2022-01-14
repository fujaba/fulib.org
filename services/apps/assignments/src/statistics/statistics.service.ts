import {Injectable} from '@nestjs/common';
import {AssignmentService} from '../assignment/assignment.service';
import {EvaluationService} from '../evaluation/evaluation.service';
import {SolutionService} from '../solution/solution.service';
import {AssignmentStatistics, EvaluationStatistics, TaskStatistics} from './statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private evaluationService: EvaluationService,
  ) {
  }

  async getAssignmentStatistics(assignment: string): Promise<AssignmentStatistics> {
    let totalPoints = 0;
    let gradedSolutions = 0;
    let totalSolutions = 0;
    for await (const {points} of this.solutionService.model.find({assignment}).select('points')) {
      totalSolutions++;
      if (points !== undefined) {
        totalPoints += points;
        gradedSolutions++;
      }
    }

    const evaluations = await this.evaluationService.findAll({assignment});

    const evaluatedSolutions = new Set<string>();
    const tasks = new Map<string, TaskStatistics>();
    const evaluationStatistics: EvaluationStatistics = {
      codeSearch: 0, editedCodeSearch: 0, manual: 0,
      total: evaluations.length,
    };
    for await (const {
      codeSearch,
      points,
      solution,
      task,
      author,
    } of this.evaluationService.model.find({assignment}).select('solution task points codeSearch author')) {
      evaluatedSolutions.add(solution);

      let item = tasks.get(task);
      if (!item) {
        item = {
          task,
          points: {codeSearch: 0, editedCodeSearch: 0, manual: 0, total: 0},
          count: {codeSearch: 0, editedCodeSearch: 0, manual: 0, total: 0},
        };
        tasks.set(task, item);
      }

      let key: keyof EvaluationStatistics;
      if (codeSearch?.origin) {
        if (author === 'Code Search') {
          key = 'codeSearch';
        } else {
          key = 'editedCodeSearch';
        }
      } else {
        key = 'manual'
      }

      evaluationStatistics[key]++;
      item.points[key] += points;
      item.points.total += points;
      item.count[key]++;
      item.count.total++;
    }

    return {
      solutions: {
        evaluated: evaluatedSolutions.size,
        graded: gradedSolutions,
        total: totalSolutions,
        pointsAvg: totalPoints / gradedSolutions,
      },
      evaluations: evaluationStatistics,
      tasks: Array.from(tasks.values()).sort((a, b) => b.points.total - a.points.total),
    };
  }
}
