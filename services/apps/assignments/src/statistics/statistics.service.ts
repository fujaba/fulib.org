import {Injectable, NotFoundException} from '@nestjs/common';
import {Task} from '../assignment/assignment.schema';
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

  private buildTaskMap(tasks: Task[], map: Map<string, Task>): void {
    for (let task of tasks) {
      map.set(task._id, task);
      this.buildTaskMap(task.children, map);
    }
  }

  async getAssignmentStatistics(assignment: string): Promise<AssignmentStatistics> {
    const assignmentDoc = await this.assignmentService.findOne(assignment);
    if (!assignmentDoc) {
      throw new NotFoundException(assignment);
    }

    const tasks = new Map<string, Task>();
    this.buildTaskMap(assignmentDoc.tasks, tasks);

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
    const taskStats = new Map<string, TaskStatistics>();
    const evaluationStatistics: EvaluationStatistics = {
      codeSearch: 0, editedCodeSearch: 0, manual: 0,
      total: evaluations.length,
    };
    const weightedEvaluationStatistics: EvaluationStatistics = {
      codeSearch: 0, editedCodeSearch: 0, manual: 0, total: 0,
    };
    for (const {
      codeSearch,
      points,
      solution,
      task,
      author,
    } of evaluations) {
      evaluatedSolutions.add(solution);

      let taskStat = taskStats.get(task);
      if (!taskStat) {
        taskStat = {
          task,
          points: {codeSearch: 0, editedCodeSearch: 0, manual: 0, total: 0},
          count: {codeSearch: 0, editedCodeSearch: 0, manual: 0, total: 0},
        };
        taskStats.set(task, taskStat);
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

      const pointsWeight = Math.abs(tasks.get(task)?.points ?? 0);
      evaluationStatistics[key]++;
      weightedEvaluationStatistics[key] += pointsWeight;
      weightedEvaluationStatistics.total += pointsWeight;
      taskStat.points[key] += points;
      taskStat.points.total += points;
      taskStat.count[key]++;
      taskStat.count.total++;
    }

    return {
      solutions: {
        evaluated: evaluatedSolutions.size,
        graded: gradedSolutions,
        total: totalSolutions,
        pointsAvg: totalPoints / gradedSolutions,
      },
      evaluations: evaluationStatistics,
      weightedEvaluations: weightedEvaluationStatistics,
      tasks: Array.from(taskStats.values()).sort((a, b) => b.points.total - a.points.total),
    };
  }
}
