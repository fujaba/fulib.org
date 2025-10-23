import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Container, CreateContainerDto} from '../../projects/model/container';
import {UserService} from '../../user/user.service';
import Assignment from '../model/assignment';
import Solution from '../model/solution';

@Injectable()
export class SolutionContainerService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
  }

  launch(assignment: Assignment, solution: Solution): Observable<Container> {
    return this.userService.getCurrent().pipe(switchMap(user => {
      const repo = `${assignment.classroom?.prefix}-${solution.author.github}`;
      const dto: CreateContainerDto = {
        dockerImage: 'registry.uni-kassel.dev/fulib/code-server-fulib:17',
        repository: `https://github.com/${assignment.classroom?.org}/${repo}.git#${solution.commit}`,
        idleTimeout: 60,
        folderName: repo,
        machineSettings: {
          'fulibFeedback.apiServer': new URL(environment.assignmentsApiUrl, location.origin).origin,
          'fulibFeedback.assignment.id': assignment._id,
          'fulibFeedback.assignment.token': assignment.token,
          'fulibFeedback.user.name': user ? user.firstName + ' ' + user.lastName : undefined,
        },
        extensions: [
          'fulib.fulibFeedback',
        ],
      };
      return this.http.post<Container>(`${environment.projectsApiUrl}/container`, dto);
    }));
  }
}
