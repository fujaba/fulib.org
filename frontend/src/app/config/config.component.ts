import {Component, OnInit} from '@angular/core';

import {saveAs} from 'file-saver';
import {ProjectConfig} from '../model/project-config';

import ProjectZipRequest from '../model/project-zip-request';
import {PrivacyService} from '../privacy.service';

import {ScenarioEditorService} from '../scenario-editor.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  config: ProjectConfig;

  constructor(
    private scenarioEditorService: ScenarioEditorService,
    private privacyService: PrivacyService,
  ) {
  }

  ngOnInit(): void {
    this.config = {
      packageName: this.scenarioEditorService.packageName,
      projectName: this.scenarioEditorService.projectName,
      projectVersion: this.scenarioEditorService.projectVersion,
      scenarioFileName: this.scenarioEditorService.scenarioFileName,
      decoratorClassName: this.scenarioEditorService.decoratorClassName,
    };
  }

  save(): void {
    this.scenarioEditorService.packageName = this.config.packageName;
    this.scenarioEditorService.projectName = this.config.projectName;
    this.scenarioEditorService.projectVersion = this.config.projectVersion;
    this.scenarioEditorService.scenarioFileName = this.config.scenarioFileName;
    this.scenarioEditorService.decoratorClassName = this.config.decoratorClassName || '';
  }

  downloadProjectZip(): void {
    const request: ProjectZipRequest = {
      ...this.config,
      privacy: this.privacyService.privacy || 'none',
      scenarioText: this.scenarioEditorService.storedScenario,
    };
    this.scenarioEditorService.downloadZip(request).subscribe(blob => {
      saveAs(blob, `${this.config.projectName}.zip`);
    });
  }
}
