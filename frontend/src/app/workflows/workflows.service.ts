import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {FileExportHelper, MIME_TYPES} from './model/helper/file-export.helper';

@Injectable()
export class WorkflowsService {

  constructor(private http: HttpClient,) {
  }

  public generate(data: string): Observable<any> {
    const url = environment.workflowsUrl + 'generate';
    return this.http.post(url, data);
  }

  public downloadZip(cmContent: string, options: any) {
    const url = environment.workflowsUrl + 'download';
    const headers: HttpHeaders = new HttpHeaders();

    this.http.post(url, cmContent, {headers: headers, params: options, responseType: 'arraybuffer'}).subscribe(
      (res) => {
        FileExportHelper.resToFileDownload(res, "Workflow.zip", MIME_TYPES.zip);
      }
    );
  }
}
