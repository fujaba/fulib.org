import {Component, OnInit, ViewChild} from '@angular/core';
import {ScenarioEditorService} from "../../scenario-editor.service";

import {saveAs} from 'file-saver'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import ProjectZipRequest from "../../model/project-zip-request";

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

  constructor(
    private scenarioEditorService: ScenarioEditorService,
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

    this.modalService.open(this.content);
  }

  private save(): void {
    this.scenarioEditorService.packageName = this.packageName;
    this.scenarioEditorService.projectName = this.projectName;
    this.scenarioEditorService.projectVersion = this.projectVersion;
    this.scenarioEditorService.scenarioFileName = this.scenarioFileName;
  }

  private downloadProjectZip(): void {
    const request: ProjectZipRequest = {
      privacy: 'all', // TODO
      packageName: this.packageName,
      projectName: this.projectName,
      projectVersion: this.projectVersion,
      scenarioFileName: this.scenarioFileName,
      scenarioText: this.scenarioEditorService.storedScenario,
    };
    this.scenarioEditorService.downloadZip(request).subscribe(blob => {
      saveAs(blob, `${this.projectName}.zip`);
    });
  }
}
