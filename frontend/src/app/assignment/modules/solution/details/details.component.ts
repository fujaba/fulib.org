import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ReadAssignmentDto} from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-solution-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class SolutionDetailsComponent implements OnInit {
  assignment?: ReadAssignmentDto;
  solution?: Solution;

  saving = false;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private toastService: ToastService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.get(aid, sid),
      ])),
    ).subscribe(([assignment, solution]) => {
      this.assignment = assignment;
      this.solution = solution;
      solution.consent ||= {};
    });
  }

  save() {
    const {assignment, _id, author} = this.solution!;
    this.saving = true;
    this.solutionService.update(assignment, _id!, {
      author,
    }).subscribe(solution => {
      this.solution = solution;
      this.saving = false;
      this.toastService.success('Solution', 'Successfully updated student details');
    }, error => {
      this.toastService.error('Solution', 'Failed to update student details');
      this.saving = false;
    });
  }
}
