import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {UserService} from '../user/user.service';
import Course from './model/course';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private _draft?: Course | null;

  private _cache = new Map<string, Course>();

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
  }

  // --------------- Draft ---------------

  public get draft(): Course | null {
    if (typeof this._draft !== 'undefined') {
      return this._draft;
    }
    const json = localStorage.getItem('courseDraft');
    return this._draft = json ? JSON.parse(json) : null;
  }

  public set draft(value: Course | null) {
    this._draft = value;
    if (value) {
      localStorage.setItem('courseDraft', JSON.stringify(value));
    } else {
      localStorage.removeItem('courseDraft');
    }
  }

  // --------------- Import/Export ---------------

  download(course: Course): void {
    const json = JSON.stringify(course, undefined, '  ');
    saveAs(new Blob([json], {type: 'application/json'}), course.title + '.json');
  }

  upload(file: File): Observable<Course> {
    return new Observable(subscriber => {
      const reader = new FileReader();
      reader.onload = _ => {
        const text = reader.result as string;
        const course: Course = {...JSON.parse(text)};
        subscriber.next(course);
      };
      reader.readAsText(file);
    });
  }

  // --------------- HTTP Methods ---------------

  public get(id: string): Observable<Course> {
    const cached = this._cache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<Course>(`${environment.assignmentsApiUrl}/courses/${id}`).pipe(
      tap(response => this._cache.set(id, response)),
    );
  }

  public create(course: Course): Observable<Course> {
    return this.http.post<Course>(`${environment.assignmentsApiUrl}/courses`, course).pipe(
      tap(response => this._cache.set(response._id!, response)),
    );
  }

  getOwn(): Observable<Course[]> {
    return this.userService.current$.pipe(
      switchMap(user => user ? this.http.get<Course[]>(`${environment.assignmentsApiUrl}/courses`, {params: {createdBy: user.id!}}) : of([])),
    );
  }
}
