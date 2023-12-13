import {Pipe, PipeTransform} from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {HttpParams} from "@angular/common/http";
import {IDE} from "../../../model/config";


@Pipe({
  name: 'fulibFeedbackLink',
})
export class FulibFeedbackLinkPipe implements PipeTransform {
  transform(ide: IDE, assignment: string, solution: string | undefined, token: string): string {
    const qs = new HttpParams({
      fromObject: {
        api_server: new URL(environment.assignmentsApiUrl, globalThis.location?.origin).origin,
        assignment,
        ...(solution ? {solution} : {}),
        token,
      },
    }).toString();
    switch (ide) {
      case 'vscode':
      case 'code-oss':
      case 'vscodium':
        return `${ide}://fulib.fulibFeedback/configure?${qs}`;
      case 'idea':
      case 'web-storm':
      case 'pycharm':
        return `jetbrains://${ide}/fulibFeedback/configure?${qs}`;
    }
  }
}
