import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {combineLatest} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {ConfigService} from '../../../services/config.service';
import {SolutionContainerService} from '../../../services/solution-container.service';
import {SolutionService} from '../../../services/solution.service';
import {solutionChildRoutes} from '../solution-routing.module';


@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;

  routes = solutionChildRoutes;
  options = this.configService.getAll();

  launching = false;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private solutionContainerService: SolutionContainerService,
    private configService: ConfigService,
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([{aid, sid}, {atok, stok}]) => {
      aid && atok && this.assignmentService.setToken(aid, atok);
      aid && sid && stok && this.solutionService.setToken(aid, sid, stok);
    });

    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => this.assignment = assignment);

    this.route.params.pipe(
      switchMap(({aid, sid}) => this.solutionService.get(aid, sid)),
    ).subscribe(solution => this.solution = solution);
  }

  launch() {
    this.launching = true;
    this.solutionContainerService.launch(this.assignment!, this.solution!).subscribe(container => {
      this.launching = false;
      open(container.url, '_blank');
    }, error => {
      this.launching = false;
      this.toastService.error('Launch in Projects', 'Failed to launch in Projects', error);
    });
  }
}
