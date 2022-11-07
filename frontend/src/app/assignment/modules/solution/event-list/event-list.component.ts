import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../../../user/user.service';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {GithubService, PushEvent} from '../../../services/github.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;

  events: PushEvent[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private githubService: GithubService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid).pipe(tap(assignment => this.assignment = assignment)),
        this.solutionService.get(aid, sid).pipe(tap(solution => this.solution = solution)),
        this.userService.getGitHubToken(),
      ])),
      switchMap(([assignment, solution, githubToken]) => {
        const {org, prefix} = assignment.classroom ?? {};
        return org && prefix && githubToken ? this.githubService.getPushEvents(org, `${prefix}-${solution.author.github}`, githubToken).pipe(catchError(() => [])) : of([]);
      }),
    ).subscribe(events => {
      this.events = events;
    });
  }

}
