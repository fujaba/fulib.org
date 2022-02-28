import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-solution-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class SolutionDetailsComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;

  saving = false;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
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

  delete() {
    if (!confirm('Are you sure you want to delete this solution and all related comments and evaluations? This action cannot be undone.')) {
      return;
    }

    const {assignment, _id} = this.solution!;
    this.solutionService.delete(assignment, _id!).subscribe(() => {
      this.toastService.warn('Solution', 'Successfully deleted solution');
      this.router.navigate(['../..'], {relativeTo: this.route});
    }, error => {
      this.toastService.error('Solution', 'Failed to delete solution', error);
    });
  }
}
