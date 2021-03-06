import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import Example from './model/example';
import {ExamplesService} from './examples.service';
import {Marker} from './model/codegen/marker';
import Request from './model/codegen/request';
import Response from './model/codegen/response';
import ProjectZipRequest from './model/project-zip-request';
import {PrivacyService} from './privacy.service';

import {environment} from '../environments/environment';

export interface Panels {
  [id: string]: Panel;
}

export interface Panel {
  closed?: boolean;
  x: number;
  y: number;
  rows: number;
  cols: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScenarioEditorService {
  private defaultScenario = `# My First Scenario

// start typing your scenario or select an example using the dropdown above.

There is a Car with name Herbie.
`;

  public readonly defaultPackageName = 'org.example';
  public readonly defaultProjectName = 'scenario';
  public readonly defaultProjectVersion = '0.1.0';
  public readonly defaultScenarioFileName = 'Scenario.md';
  public readonly defaultDecoratorClassName = 'GenModel';

  private _panels?: Panels;

  private _storedScenario?: string;

  private _packageName: string | null;
  private _projectName: string | null;
  private _projectVersion: string | null;
  private _scenarioFileName: string | null;
  private _decoratorClassName: string | null;

  private _selectedExample: Example | null;

  private _autoSubmit?: boolean;

  constructor(
    private examplesService: ExamplesService,
    private privacyService: PrivacyService,
    private http: HttpClient,
  ) {
  }

  get panels(): Panels {
    const panels = this._panels ?? JSON.parse(this.privacyService.getStorage('panels') ?? '{}') as Panels;
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

  set panels(value: Panels) {
    this._panels = value;
    this.privacyService.setStorage('panels', JSON.stringify(value));
  }

  get storedScenario(): string {
    return this._storedScenario ?? this.privacyService.getStorage('storedScenario') ?? this.defaultScenario;
  }

  set storedScenario(value: string) {
    if (this._storedScenario !== value) {
      this._storedScenario = value;
      this.privacyService.setStorage('storedScenario', value);
    }
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

  get packageName(): string {
    return this._packageName ?? this.privacyService.getStorage('packageName') ?? this.defaultPackageName;
  }

  set packageName(value: string) {
    if (this._packageName !== value) {
      this._packageName = value;
      this.privacyService.setStorage('packageName', value);
    }
  }

  get projectName(): string {
    return this._projectName ?? this.privacyService.getStorage('projectName') ?? this.defaultProjectName;
  }

  set projectName(value: string) {
    if (this._projectName !== value) {
      this._projectName = value;
      this.privacyService.setStorage('projectName', value);
    }
  }

  get projectVersion(): string {
    return this._projectVersion ?? this.privacyService.getStorage('projectVersion') ?? this.defaultProjectVersion;
  }

  set projectVersion(value: string) {
    if (this._projectVersion !== value) {
      this._projectVersion = value;
      this.privacyService.setStorage('projectVersion', value);
    }
  }

  get scenarioFileName(): string {
    return this._scenarioFileName ?? this.privacyService.getStorage('scenarioFileName') ?? this.defaultScenarioFileName;
  }

  set scenarioFileName(value: string) {
    if (this._scenarioFileName !== value) {
      this._scenarioFileName = value;
      this.privacyService.setStorage('scenarioFileName', value);
    }
  }

  get decoratorClassName(): string {
    return this._decoratorClassName ?? this.privacyService.getStorage('decoratorClassName') ?? this.defaultDecoratorClassName;
  }

  set decoratorClassName(value: string) {
    if (this._decoratorClassName !== value) {
      this._decoratorClassName = value;
      this.privacyService.setStorage('decoratorClassName', value);
    }
  }

  submit(codeGenRequest: Request): Observable<Response> {
    return this.http.post<Response>(environment.apiURL + '/runcodegen', codeGenRequest);
  }

  downloadZip(projectZipRequest: ProjectZipRequest): Observable<Blob> {
    return this.http.post(environment.apiURL + '/projectzip', projectZipRequest, {responseType: 'blob'});
  }

  lint(response: Response): Marker[] {
    const result: Marker[] = [];

    for (const line of response.output.split('\n')) {
      const match = /^.*\.md:(\d+):(\d+)(?:-(\d+))?: (error|syntax|warning|note): (.*)$/.exec(line);
      if (!match) {
        continue;
      }

      const row = +match[1] - 1;
      const col = +match[2];
      const endCol = +(match[3] || col) + 1;
      const severity = match[4] === 'syntax' ? 'error' : match[4];
      const message = match[5];

      result.push({
        severity,
        message,
        from: {line: row, ch: col},
        to: {line: row, ch: endCol},
      });
    }

    return result;
  }

  foldInternalCalls(outputLines: string[]): string[] {
    const packageName = this.packageName.replace('/', '.');
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
