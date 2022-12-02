import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Container, CreateContainerDto} from '../../projects/model/container';
import Assignment from '../model/assignment';
import Solution from '../model/solution';

@Injectable({
  providedIn: 'root',
})
export class SolutionContainerService {
  constructor(
    private http: HttpClient,
  ) {
  }

  launch(assignment: Assignment, solution: Solution): Observable<Container> {
    const dto: CreateContainerDto = {
      dockerImage: 'registry.uniks.de/fulib/code-server-fulib:17',
      repository: `https://github.com/${assignment.classroom?.org}/${assignment.classroom?.prefix}-${solution.author.github}.git#${solution.commit}`,
    };
    return this.http.post<Container>(`${environment.projectsApiUrl}/container`, dto);
  }
}
