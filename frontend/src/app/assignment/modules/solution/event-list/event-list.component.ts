import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../../../user/user.service';
import {ReadAssignmentDto} from '../../../model/assignment';
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
  assignment?: ReadAssignmentDto;
  solution?: Solution;

  events: PushEvent[] = [];

  reasons: string[] = [];

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
        this.userService.getGitHubToken().pipe(catchError(() => {
          this.reasons.push('You are not logged in');
          return of(undefined);
        })),
      ])),
      switchMap(([assignment, solution, githubToken]) => {
        const {org, prefix} = assignment.classroom ?? {};
        if (!org || !prefix) {
          this.reasons.push('The Classroom organisation or prefix are not set for this assignment');
        }
        if (!githubToken) {
          this.reasons.push('You are not logged in with GitHub');
        }
        const githubUser = solution.author.github;
        if (!githubUser) {
          this.reasons.push('This solution is not linked to a GitHub user');
        }
        if (!org || !prefix || !githubToken || !githubUser) {
          return of([]);
        }
        return this.githubService.getPushEvents(org, `${prefix}-${githubUser}`, githubToken);
      }),
    ).subscribe(events => {
      this.events = events;
    }, error => {
      console.error(error);
      this.reasons.push(error.message);
    });
  }

}
