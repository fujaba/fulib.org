import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {saveAs} from 'file-saver';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {GenerateResult} from './model/GenerateResult';
import {createMapFromAnswer} from './model/helper/map.helper';
import {ExportOptions} from './model/ExportOptions';

@Injectable()
export class WorkflowsService {

  constructor(
    private http: HttpClient,
  ) {
  }

  public generate(data: string): Observable<GenerateResult> {
    const url = environment.workflowsUrl + '/generate';
    return this.http.post<any>(url, data).pipe(map(result => WorkflowsService.toGenerateResult(result)));
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
      responseType: 'arraybuffer'
    }).subscribe(
      (res) => {
        const blob = new Blob([res], {type: 'application/zip'});
        const file = new File([blob], 'Workflows.zip', {type: 'application/zip'});
        saveAs(file);
      }
    );
  }

  private static toGenerateResult(result: any): GenerateResult {
    const pages = createMapFromAnswer(result.pages, result.numberOfPages);
    const diagrams = createMapFromAnswer(result.diagrams, result.numberOfDiagrams);
    const fxmls = createMapFromAnswer(result.fxmls, result.numberOfFxmls);
    return {
      board: result.board,
      pages: pages,
      numberOfPages: result.numberOfPages,
      diagrams: diagrams,
      numberOfDiagrams: result.numberOfDiagrams,
      fxmls: fxmls,
      numberOfFxmls: result.numberOfFxmls,
      classDiagram: result.classDiagram,
    }
  }
}
