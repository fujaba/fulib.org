import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {environment} from '../../environments/environment';
import {PrivacyService} from '../services/privacy.service';
import {Panel} from './model/panel';
import {Request} from './model/request';
import {Response} from './model/response';

@Injectable({providedIn: 'root'})
export class EditorService {
  private _panels?: Record<string, Panel>;
  private _autoSubmit?: boolean;

  constructor(
    private privacyService: PrivacyService,
    private http: HttpClient,
  ) {
  }

  get panels(): Record<string, Panel> {
    const panels: Record<string, Panel> = this._panels ?? JSON.parse(this.privacyService.getStorage('panels') ?? '{}');
    if (!panels.scenario) {
      panels.scenario = {x: 0, y: 0, rows: 6, cols: 4};
    }
    if (!panels.output) {
      panels.output = {x: 4, y: 0, rows: 6, cols: 4};
    }
    if (!panels.java) {
      panels.java = {x: 8, y: 0, rows: 6, cols: 4};
    }
    if (!panels.markdown) {
      panels.markdown = {x: 0, y: 6, rows: 6, cols: 4};
    }
    if (!panels.classDiagram) {
      panels.classDiagram = {x: 4, y: 6, rows: 6, cols: 4};
    }
    if (!panels.objectDiagrams) {
      panels.objectDiagrams = {x: 8, y: 6, rows: 6, cols: 4};
    }
    return panels;
  }

  set panels(value: Record<string, Panel>) {
    this._panels = value;
    this.privacyService.setStorage('panels', JSON.stringify(value));
  }

  get autoSubmit(): boolean {
    if (typeof this._autoSubmit === 'undefined') {
      this._autoSubmit = this.privacyService.getStorage('autoSubmit') !== 'false';
    }
    return this._autoSubmit;
  }

  set autoSubmit(value: boolean) {
    this._autoSubmit = value;
    this.privacyService.setStorage('autoSubmit', '' + value);
  }

  submit(codeGenRequest: Request): Observable<Response> {
    return this.http.post<Response>(environment.apiURL + '/runcodegen', codeGenRequest);
  }
}
