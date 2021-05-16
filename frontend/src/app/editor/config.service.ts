import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import ProjectZipRequest from '../model/project-zip-request';
import {PrivacyService} from '../privacy.service';

@Injectable({providedIn: 'root'})
export class ConfigService {
  public readonly defaultPackageName = 'org.example';
  public readonly defaultProjectName = 'scenario';
  public readonly defaultProjectVersion = '0.1.0';
  public readonly defaultScenarioFileName = 'Scenario.md';
  public readonly defaultDecoratorClassName = 'GenModel';

  private _packageName: string | null;
  private _projectName: string | null;
  private _projectVersion: string | null;
  private _scenarioFileName: string | null;
  private _decoratorClassName: string | null;

  constructor(
    private privacyService: PrivacyService,
    private http: HttpClient,
  ) {
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

  downloadZip(projectZipRequest: ProjectZipRequest): Observable<Blob> {
    return this.http.post(environment.apiURL + '/projectzip', projectZipRequest, {responseType: 'blob'});
  }
}
