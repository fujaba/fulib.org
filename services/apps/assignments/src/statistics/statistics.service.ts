import {Injectable, NotFoundException} from '@nestjs/common';
import {AssignmentDocument, Task} from '../assignment/assignment.schema';
import {AssignmentService} from '../assignment/assignment.service';
import {CommentService} from '../comment/comment.service';
import {EvaluationService} from '../evaluation/evaluation.service';
import {SolutionService} from '../solution/solution.service';
import {
  AssignmentStatistics,
  EvaluationStatistics,
  SolutionStatistics,
  TaskStatistics,
  TimeStatistics
} from './statistics.dto';
import {Types} from "mongoose";

const outlierDuration = 60;

@Injectable()
export class StatisticsService {
  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private evaluationService: EvaluationService,
    private commentService: CommentService,
  ) {
  }

  private buildTaskMap(tasks: Task[], map: Map<string, Task>): void {
    for (const task of tasks) {
      map.set(task._id, task);
      this.buildTaskMap(task.children, map);
    }
  }

  async getAssignmentStatistics(assignment: Types.ObjectId): Promise<AssignmentStatistics> {
    const assignmentDoc = await this.assignmentService.find(assignment);
    if (!assignmentDoc) {
      throw new NotFoundException(assignment);
    }

    const tasks = new Map<string, Task>();
    this.buildTaskMap(assignmentDoc.tasks, tasks);

    const taskStats = new Map<string, TaskStatistics>();
    for (const task of tasks.keys()) {
      taskStats.set(task, {
        task,
        points: this.createEmptyEvaluationStatistics(),
        count: this.createEmptyEvaluationStatistics(),
        timeAvg: 0,
      });
    }

    const evaluations = this.createEmptyEvaluationStatistics();
    const weightedEvaluations = this.createEmptyEvaluationStatistics();

    const [
      time,
      comments,
      solutions,
      ,
    ] = await Promise.all([
      this.timeStatistics(assignment, taskStats, tasks),
      this.countComments(assignment),
      this.solutionStatistics(assignmentDoc),
      this.fillEvaluationStatistics(assignment, taskStats, tasks, evaluations, weightedEvaluations),
    ]);

    // needs to happen after timeStatistics and fillEvaluationStatistics
    for (const taskStat of taskStats.values()) {
      time.codeSearchSavings += taskStat.count.codeSearch * taskStat.timeAvg;
    }

    return {
      solutions,
      evaluations,
      weightedEvaluations,
      time,
      comments,
      tasks: Array.from(taskStats.values()),
    };
  }

  private async fillEvaluationStatistics(assignment: Types.ObjectId, taskStats: Map<string, TaskStatistics>, tasks: Map<string, Task>, evaluationStatistics: EvaluationStatistics, weightedEvaluationStatistics: EvaluationStatistics) {
    for await (const {
      codeSearch,
      points,
      task,
      author,
    } of this.evaluationService.model.find({assignment}).select('codeSearch points task author')) {
      const taskStat = taskStats.get(task);
      if (!taskStat) { // orphaned, ignore
        continue;
      }

      let key: keyof EvaluationStatistics;
      if (codeSearch?.origin) {
        if (author === 'Code Search') {
          key = 'codeSearch';
        } else {
          key = 'editedCodeSearch';
        }
      } else {
        key = 'manual';
      }

      const pointsWeight = Math.abs(tasks.get(task)?.points ?? 0);
      evaluationStatistics[key]++;
      evaluationStatistics.total++;
      weightedEvaluationStatistics[key] += pointsWeight;
      weightedEvaluationStatistics.total += pointsWeight;
      taskStat.points[key] += points;
      taskStat.points.total += points;
      taskStat.count[key]++;
      taskStat.count.total++;
    }
  }

  private async timeStatistics(assignment: Types.ObjectId, taskStats: Map<string, TaskStatistics>, tasks: Map<string, Task>): Promise<TimeStatistics> {
    let eventCount = 0;
    let totalTime = 0;
    let weightedTime = 0;
    for await (const result of this.evaluationService.model.aggregate([
      {
        $match: {
          assignment,
          duration: {$lt: outlierDuration},
        },
      },
      {
        $group: {
          _id: '$task',
          time: {$sum: '$duration'},
          count: {$sum: 1},
        },
      }
    ])) {
      const {_id, time, count} = result;
      const taskStat = taskStats.get(_id);
      if (taskStat) {
        taskStat.timeAvg = time / count;
      }
      eventCount += count;
      totalTime += time;
      weightedTime += time / Math.abs(tasks.get(_id)?.points ?? 1);
    }
    return {
      evaluationTotal: totalTime,
      evaluationAvg: totalTime / eventCount,
      pointsAvg: weightedTime / eventCount,
      codeSearchSavings: 0, // NB: calculated later, once taskStats.count is set by fillEvaluationStatistics
    };
  }

  private countComments(assignment: Types.ObjectId) {
    return this.commentService.model.countDocuments({
      assignment,
    }).exec();
  }

  private createEmptyEvaluationStatistics() {
    return {codeSearch: 0, editedCodeSearch: 0, manual: 0, total: 0};
  }

  private async solutionStatistics(assignment: AssignmentDocument): Promise<SolutionStatistics> {
    const passingPoints = assignment.passingPoints ?? assignment.tasks.reduce((a, c) => c.points > 0 ? a + c.points : a, 0) / 2;
    const [result] = await this.solutionService.model.aggregate([
      {$match: {assignment: assignment._id}},
      {
        $group: {
          _id: null,
          total: {$sum: 1},
          points: {$sum: '$points'},
          graded: {$sum: {$cond: [{$gt: ['$points', null]}, 1, 0]}},
          passed: {$sum: {$cond: [{$gte: ['$points', passingPoints]}, 1, 0]}},
        },
      },
    ]);
    if (!result) {
      return {
        total: 0,
        evaluated: 0,
        graded: 0,
        passed: 0,
        pointsAvg: 0,
      };
    }
    const {total, points, graded, passed} = result;
    const evaluated = (await this.evaluationService.findUnique('solution', {assignment: assignment._id})).length;
    return {
      total,
      evaluated,
      graded,
      passed,
      pointsAvg: points / graded,
    };
  }
}
