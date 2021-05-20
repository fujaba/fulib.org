import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {environment} from '../environments/environment';
import Request from './model/codegen/request';
import Response from './model/codegen/response';
import {PrivacyService} from './privacy.service';


@Injectable({
  providedIn: 'root',
})
export class ScenarioEditorService {
  constructor(
    private privacyService: PrivacyService,
    private http: HttpClient,
  ) {
  }

  submit(codeGenRequest: Request): Observable<Response> {
    return this.http.post<Response>(environment.apiURL + '/runcodegen', codeGenRequest);
  }

  foldInternalCalls(packageName: string, outputLines: string[]): string[] {
    packageName = packageName.replace('/', '.');
    const packageNamePrefix = `\tat ${packageName}.`;
    const result: string[] = [];
    let counter = 0;
    for (const line of outputLines) {
      if (line.startsWith('\tat org.fulib.scenarios.tool.')
        || line.startsWith('\tat ') && !line.startsWith('\tat org.fulib.') && !line.startsWith(packageNamePrefix)) {
        counter++;
      } else {
        if (counter > 0) {
          result.push(counter === 1 ? '\t(1 internal call)' : `\t(${counter} internal calls)`);
          counter = 0;
        }
        result.push(line);
      }
    }
    return result;
  }
}
