import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Task from '../../../model/task';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';

interface StatisticItem {
  tasks: Task[];
  totalPoints: number;
  totalGiven: number;
}

@Component({
  selector: 'app-assignment-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  results: StatisticItem[] = [];
  totalSolutions = 0;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private taskService: TaskService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.getEvaluations(aid),
      ])),
    ).subscribe(([assignment, evaluations]) => {
      const solutions = new Set<string>();
      const taskTotals = new Map<string, StatisticItem>();
      for (let evaluation of evaluations) {
        solutions.add(evaluation.solution);

        const task = evaluation.task;

        let item = taskTotals.get(task);
        if (!item) {
          item = {
            totalPoints: 0,
            totalGiven: 0,
            tasks: this.taskService.findWithParents(assignment.tasks, task),
          };
          taskTotals.set(task, item);
        }

        item.totalPoints += evaluation.points;
        item.totalGiven++;
      }

      this.totalSolutions = solutions.size;
      this.results = Array.from(taskTotals.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
      ;
    });
  }
}
