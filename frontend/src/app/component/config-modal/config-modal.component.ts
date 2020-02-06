import {Component, OnInit, ViewChild} from '@angular/core';
import {ScenarioEditorService} from "../../scenario-editor.service";

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

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

  }
}
