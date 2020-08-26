import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import Course from './model/course';
import {environment} from '../../environments/environment';

type CourseResponse = { id: string, descriptionHtml: string }

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private _draft?: Course | null;

  private _cache = new Map<string, Course>();

  constructor(
    private http: HttpClient,
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
    return this.http.get<Course>(`${environment.apiURL}/courses/${id}`).pipe(
      map(response => {
        this._cache.set(id, response);
        return response;
      }),
    );
  }

  public create(course: Course): Observable<Course> {
    return this.http.post<CourseResponse>(`${environment.apiURL}/courses`, course).pipe(
      map(response => {
        const result = {
          ...course,
          ...response,
        } as Course;
        this._cache.set(response.id, result);
        return result;
      }),
    );
  }
}
