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
    let codeSearchEvaluations = 0;
    let editedCodeSearchEvaluations = 0;
    let manualEvaluations = 0;
    for await (const {
      codeSearch,
      points,
      solution,
      task,
      author,
    } of this.evaluationService.model.find({assignment}).select('solution task points codeSearch author')) {
      evaluatedSolutions.add(solution);

      if (codeSearch?.origin) {
        if (author === 'Code Search') {
          codeSearchEvaluations++;
        } else {
          editedCodeSearchEvaluations++;
        }
      } else {
        manualEvaluations++;
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
        evaluated: evaluatedSolutions.size,
        graded: gradedSolutions,
        total: totalSolutions,
        pointsAvg: totalPoints / gradedSolutions,
      },
      evaluations: {
        codeSearch: codeSearchEvaluations,
        editedCodeSearch: editedCodeSearchEvaluations,
        manual: manualEvaluations,
        total: evaluations.length,
      },
      tasks: Array.from(tasks.values()).sort((a, b) => b.totalPoints - a.totalPoints),
    };
  }
}
