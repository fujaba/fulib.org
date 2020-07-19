import {Component, OnInit} from '@angular/core';
import Solution from '../model/solution';
import Assignment from '../model/assignment';
import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

@Component({
  selector: 'app-my-solutions',
  templateUrl: './my-solutions.component.html',
  styleUrls: ['./my-solutions.component.scss']
})
export class MySolutionsComponent implements OnInit {
  private _assignments = new Map<string, { assignment: Assignment, solutions: Solution[] }>();

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

  get assignments(): Assignment[] {
    // TODO see sort performance concern in assignment list component
    return Array.from(this._assignments.values()).map(a => a.assignment).filter(a => a).sort(Assignment.comparator);
  }

  getSolutions(assignment: Assignment): Solution[] {
    return this._assignments.get(assignment.id).solutions;
  }

  ngOnInit() {
    this.solutionService.getOwn().subscribe(solutions => {
      for (const solution of solutions) {
        const aid: string = solution.assignment as any;
        let holder = this._assignments.get(aid);
        if (!holder) {
          holder = {
            assignment: undefined,
            solutions: [],
          };
          this._assignments.set(aid, holder);

          this.assignmentService.get(aid).subscribe(assignment => holder.assignment = assignment);
        }
        holder.solutions.push(solution);
      }
    });
  }
}
