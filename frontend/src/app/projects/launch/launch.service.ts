import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConfigService} from '../config.service';
import {Container} from '../model/container';
import {LaunchConfig} from './model/launch-config';

@Injectable({providedIn: 'root'})
export class LaunchService {
  private readonly namespace = 'launch';

  constructor(
    private configService: ConfigService,
  ) {
  }

  getLaunchConfigs(container: Container): Observable<LaunchConfig[]> {
    return this.configService.getObjects(container, this.namespace);
  }

  getLaunchConfig(container: Container, id: string): Observable<LaunchConfig> {
    return this.configService.getObject<LaunchConfig>(container, 'launch', id);
  }

  saveLaunchConfig(container: Container, config: LaunchConfig): Observable<void> {
    return this.configService.putObject(container, 'launch', config);
  }

  deleteLaunchConfig(container: Container, config: LaunchConfig): Observable<void> {
    return this.configService.deleteObject<LaunchConfig>(container, 'launch', config);
  }
}
