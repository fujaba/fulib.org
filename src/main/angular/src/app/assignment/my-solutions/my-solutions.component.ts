import {Component, OnInit} from '@angular/core';
import Solution from '../model/solution';
import Assignment from '../model/assignment';
import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-my-solutions',
  templateUrl: './my-solutions.component.html',
  styleUrls: ['./my-solutions.component.scss'],
})
export class MySolutionsComponent implements OnInit {
  assignments?: Assignment[];
  solutions?: Map<string, Solution[]>;

  constructor(
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
  ) {
  }

  get name(): string | null {
    return this.solutionService.name;
  }

  get email(): string | null {
    return this.solutionService.email;
  }

  get studentID(): string | null {
    return this.solutionService.studentID;
  }

  ngOnInit() {
    const compoundIds = this.solutionService.getOwnIds();
    const assignmentIds = [...new Set<string>(compoundIds.map(id => id.assignment))];

    const assignments = forkJoin(assignmentIds.map(aid => this.assignmentService.get(aid)));
    const solutions = forkJoin(compoundIds.map(cid => this.solutionService.get(cid.assignment, cid.id)));

    forkJoin([assignments, solutions]).subscribe(([assignments, solutions]) => {
      this.assignments = assignments.sort(Assignment.comparator);
      this.solutions = new Map<string, Solution[]>();

      for (const assignment of this.assignments) {
        this.solutions.set(assignment.id!, []);
      }

      for (const solution of solutions) {
        this.solutions.get(solution.assignment)!.push(solution);
      }

      for (const [_, solutionList] of this.solutions) {
        solutionList.sort((a, b) => new Date(a.timeStamp || 0).getTime() - new Date(b.timeStamp || 0).getTime());
      }
    });
  }
}
