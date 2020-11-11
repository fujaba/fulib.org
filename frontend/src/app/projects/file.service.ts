import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {File, FileStub} from './model/file';

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

  download(projectId: string, id: string): Observable<string> {
    return this.http.get(`${environment.apiURL}/projects/${projectId}/files/${id}/content`, {responseType: 'text'});
  }

  upload(projectId: string, id: string, content: string): Observable<void> {
    return this.http.put<void>(`${environment.apiURL}/projects/${projectId}/files/${id}/content`, content);
  }
}
