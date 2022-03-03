import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {saveAs} from 'file-saver';
import {ExportOptions} from './model/ExportOptions';
import {GenerateResult} from './model/GenerateResult';
import {environment} from '../../environments/environment';

@Injectable()
export class WorkflowsService {

  constructor(
    private http: HttpClient,
  ) {
  }

  public generate(data: string): Observable<GenerateResult> {
    const url = environment.workflowsUrl + '/generate';
    return this.http.post<GenerateResult>(url, data);
  }

  public downloadZip(cmContent: string, options: ExportOptions) {
    const url = environment.workflowsUrl + '/download';
    const headers: HttpHeaders = new HttpHeaders();

    this.http.post(url, cmContent, {
      headers: headers,
      params: {
        yaml: options.yaml,
        board: options.board,
        pages: options.pages,
        objects: options.objects,
        class: options.class,
        fxmls: options.fxmls,
      },
      responseType: 'arraybuffer',
    }).subscribe(
      (res) => {
        const blob = new Blob([res], {type: 'application/zip'});
        const file = new File([blob], 'Workflows.zip', {type: 'application/zip'});
        saveAs(file);
      }
    );
  }
}
