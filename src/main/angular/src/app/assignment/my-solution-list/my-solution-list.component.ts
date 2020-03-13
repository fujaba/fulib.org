import {Component, OnInit} from '@angular/core';
import Solution from '../model/solution';
import Assignment from '../model/assignment';
import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

@Component({
  selector: 'app-my-solution-list',
  templateUrl: './my-solution-list.component.html',
  styleUrls: ['./my-solution-list.component.scss']
})
export class MySolutionListComponent implements OnInit {
  private _assignments = new Map<string, { assignment: Assignment, solutions: Solution[] }>();

  constructor(
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
  ) {
  }

  get assignments(): Assignment[] {
    // TODO see sort performance concern in assignment list component
    return Array.from(this._assignments.values()).map(a => a.assignment).filter(a => a).sort(Assignment.comparator);
  }

  getSolutions(assignment: Assignment): Solution[] {
    return this._assignments.get(assignment.id).solutions;
  }

  ngOnInit() {
    for (const {assignment: aid, id: sid} of this.solutionService.getOwnIds()) {
      let holder = this._assignments.get(aid);
      if (!holder) {
        holder = {
          assignment: undefined,
          solutions: [],
        };
        this._assignments.set(aid, holder);

        this.assignmentService.get(aid).subscribe(assignment => holder.assignment = assignment);
      }

      this.solutionService.get(aid, sid).subscribe(solution => {
        holder.solutions.push(solution);
        // TODO see sort performance concern in assignment list component
        holder.solutions.sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime());
      });
    }
  }
}
