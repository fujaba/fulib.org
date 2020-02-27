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
  private _draft?: Course | null;

  constructor(
    private http: HttpClient,
  ) {
  }

  public get draft(): Course | null {
    if (typeof this._draft === 'undefined') {
      const json = localStorage.getItem('courseDraft');
      this._draft = json ? {...JSON.parse(json)} : null;
    }
    return this._draft;
  }

  public set draft(value: Course | null) {
    this._draft = value;
    if (value) {
      localStorage.setItem('courseDraft', JSON.stringify(value));
    }
    else {
      localStorage.removeItem('courseDraft');
    }
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
