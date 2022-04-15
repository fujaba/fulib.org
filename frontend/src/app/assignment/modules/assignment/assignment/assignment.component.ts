import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import {AssignmentService} from '../../../services/assignment.service';
import {assignmentChildRoutes} from '../assignment-routing.module';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss'],
})
export class AssignmentComponent implements OnInit {
  assignment?: Assignment;
  routes = assignmentChildRoutes;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
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
}
