import {Injectable} from '@angular/core';
import {ProjectConfig} from '../../model/project-config';
import {Project} from '../model/project';

@Injectable()
export class SetupService {
  constructor() {
  }

  getDefaultConfig(project: Project): ProjectConfig {
    const projectSlug = project.name.replace(/\W+/, '-').toLowerCase();
    return {
      projectName: projectSlug,
      packageName: 'org.example',
      projectVersion: '0.1.0',
      scenarioFileName: 'Scenario.md',
      decoratorClassName: 'GenModel',
    };
  }
}
