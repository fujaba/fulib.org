import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, forkJoin} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../../../user/user.service';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {ConfigService} from '../../../services/config.service';
import {SolutionService} from '../../../services/solution.service';
import {solutionChildRoutes} from '../solution-routing.module';

interface PushEvent {
  created_at: string;
  type: 'PushEvent';
  actor: {
    login: string;
  };
  payload: {
    commits: {
      sha: string;
      author: { name: string };
      message: string;
      url: string;
    }[];
  };
}

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

  pushEvents: PushEvent[] = [];
  pushedAt?: string;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private configService: ConfigService,
    private userService: UserService,
    private http: HttpClient,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([{aid, sid}, {atok, stok}]) => {
      aid && atok && this.assignmentService.setToken(aid, atok);
      aid && sid && stok && this.solutionService.setToken(aid, sid, stok);
    });

    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid).pipe(tap(assignment => this.assignment = assignment)),
        this.solutionService.get(aid, sid).pipe(tap(solution => this.solution = solution)),
        this.userService.getGitHubToken(),
      ])),
      switchMap(([assignment, solution, githubToken]) => this.http.get<PushEvent[]>(`https://api.github.com/repos/${assignment.classroom?.org}/${assignment.classroom?.prefix}-${solution.author.github}/events`, {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      }).pipe(catchError(() => []))),
    ).subscribe(events => {
      this.pushEvents = events
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .filter(e => e.type === 'PushEvent');
      this.pushedAt = this.pushEvents.find(e => e.payload.commits.find(c => c.sha === this.solution?.commit))?.created_at;
    });
  }

}
