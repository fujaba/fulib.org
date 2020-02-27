import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import Course from './model/course';
import {environment} from '../../environments/environment';

type CourseResponse = { id: string, descriptionHtml: string }

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(
    private http: HttpClient,
  ) {
  }

  public get(id: string): Observable<Course> {
    return this.http.get<Course>(`${environment.apiURL}/courses/${id}`);
  }

  public create(course: Course): Observable<Course> {
    return this.http.post<CourseResponse>(`${environment.apiURL}/courses`, course).pipe(
      map(response => {
        return {
          ...course,
          ...response,
        } as Course;
      })
    );
  }
}
