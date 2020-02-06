import {Component, OnInit} from '@angular/core';
import {ScenarioEditorService} from "../../scenario-editor.service";

declare var $: any;

@Component({
  selector: 'app-config-modal',
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss']
})
export class ConfigModalComponent implements OnInit {
  packageName: string;
  projectName: any;
  projectVersion: any;
  scenarioFileName: any;

  constructor(
    private scenarioEditorService: ScenarioEditorService,
  ) {
  }

  ngOnInit() {
  }

  open(): void {
    this.packageName = this.scenarioEditorService.packageName;
    this.projectName = this.scenarioEditorService.projectName;
    this.projectVersion = this.scenarioEditorService.projectVersion;
    this.scenarioFileName = this.scenarioEditorService.scenarioFileName;
    $('#configModal').modal('show');
  }

  private save(): void {
    this.scenarioEditorService.packageName = this.packageName;
    this.scenarioEditorService.projectName = this.projectName;
    this.scenarioEditorService.projectVersion = this.projectVersion;
    this.scenarioEditorService.scenarioFileName = this.scenarioFileName;
  }

  private downloadProjectZip(): void {

  }
}
