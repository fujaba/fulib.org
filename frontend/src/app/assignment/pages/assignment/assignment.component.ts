import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {TokenModalComponent} from '../token-modal/token-modal.component';
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

  readonly origin: string;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]).pipe(
      map(([params, query]) => {
        const assignmentId: string = params.aid;
        if (query.atok) {
          this.assignmentService.setToken(assignmentId, query.atok);
        }
        return assignmentId;
      }),
      switchMap(assignmentId => this.assignmentService.get(assignmentId)),
    ).subscribe(assignment => {
      this.assignment = assignment;
    }, error => {
      if (error.status === 401) {
        this.router.navigate(['token'], {relativeTo: this.activatedRoute});
      }
    });
  }

  import() {
    // TODO update table
    this.solutionService.import(this.assignment!._id!).subscribe();
  }
}
