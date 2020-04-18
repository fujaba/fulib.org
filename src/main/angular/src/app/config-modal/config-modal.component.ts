import {Component, OnInit, ViewChild} from '@angular/core';

import {saveAs} from 'file-saver'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ScenarioEditorService} from "../scenario-editor.service";

import ProjectZipRequest from "../model/project-zip-request";
import {PrivacyService} from "../privacy.service";

@Component({
  selector: 'app-config-modal',
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss']
})
export class ConfigModalComponent implements OnInit {
  @ViewChild('content', {static: true}) content;

  packageName: string;
  projectName: any;
  projectVersion: any;
  scenarioFileName: any;
  decoratorClassName: string;

  constructor(
    private scenarioEditorService: ScenarioEditorService,
    private privacyService: PrivacyService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit() {
  }

  open(): void {
    this.packageName = this.scenarioEditorService.packageName;
    this.projectName = this.scenarioEditorService.projectName;
    this.projectVersion = this.scenarioEditorService.projectVersion;
    this.scenarioFileName = this.scenarioEditorService.scenarioFileName;
    this.decoratorClassName = this.scenarioEditorService.decoratorClassName;

    this.modalService.open(this.content);
  }

  save(): void {
    this.scenarioEditorService.packageName = this.packageName;
    this.scenarioEditorService.projectName = this.projectName;
    this.scenarioEditorService.projectVersion = this.projectVersion;
    this.scenarioEditorService.scenarioFileName = this.scenarioFileName;
    this.scenarioEditorService.decoratorClassName = this.decoratorClassName;
  }

  downloadProjectZip(): void {
    const request: ProjectZipRequest = {
      privacy: this.privacyService.privacy,
      packageName: this.packageName,
      projectName: this.projectName,
      projectVersion: this.projectVersion,
      scenarioFileName: this.scenarioFileName,
      scenarioText: this.scenarioEditorService.storedScenario,
      decoratorClassName: this.decoratorClassName,
    };
    this.scenarioEditorService.downloadZip(request).subscribe(blob => {
      saveAs(blob, `${this.projectName}.zip`);
    });
  }
}
