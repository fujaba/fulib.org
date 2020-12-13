import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {File, FileStub} from './model/file';
import {Revision} from './model/revision';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private http: HttpClient,
  ) {
  }

  create(file: FileStub): Observable<File> {
    return this.http.post<File>(`${environment.apiURL}/projects/${file.projectId}/files`, file);
  }

  get(projectId: string, id: string): Observable<File> {
    return this.http.get<File>(`${environment.apiURL}/projects/${projectId}/files/${id}`);
  }

  getChildren(projectId: string, parentId: string): Observable<File[]> {
    return this.http.get<File[]>(`${environment.apiURL}/projects/${projectId}/files`, {params: {parentId}});
  }

  update(file: File): Observable<File> {
    return this.http.put<File>(`${environment.apiURL}/projects/${file.projectId}/files/${file.id}`, {...file, data: undefined});
  }

  delete(projectId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiURL}/projects/${projectId}/files/${id}`);
  }

  download(file: File, revision: Revision): Observable<string> {
    return this.http.get(`${environment.apiURL}/projects/${file.projectId}/files/${file.id}/revisions/${revision.id}`, {responseType: 'text'});
  }

  upload(file: File, content: string): Observable<Revision> {
    return this.http.post<Revision>(`${environment.apiURL}/projects/${file.projectId}/files/${file.id}/revisions`, content);
  }
}
