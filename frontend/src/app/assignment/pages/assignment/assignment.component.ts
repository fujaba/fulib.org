import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ToastService} from '../../../toast.service';
import Assignment from '../../model/assignment';
import {AssignmentService} from '../../services/assignment.service';
import {SolutionService} from '../../services/solution.service';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss'],
})
export class AssignmentComponent implements OnInit {
  assignment?: Assignment;
  importing = false;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([{aid}, {atok}]) => {
      aid && atok && this.assignmentService.setToken(aid, atok);
    });

    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => {
      this.assignment = assignment;
    }, error => {
      if (error.status === 401 || error.status === 403) {
        this.router.navigate(['token'], {relativeTo: this.route});
      }
    });
  }

  import() {
    // TODO update table
    this.importing = true;
    this.solutionService.import(this.assignment!._id!).subscribe(results => {
      this.importing = false;
      this.toastService.success('Import', `Successfully imported ${results.length} solutions`);
    }, error => {
      this.importing = false;
      this.toastService.error('Import', 'Failed to import solutions', error);
    });
  }
}
