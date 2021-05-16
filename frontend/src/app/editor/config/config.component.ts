import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import {saveAs} from 'file-saver';
import {map} from 'rxjs/operators';
import {ProjectConfig} from '../../model/project-config';

import ProjectZipRequest from '../../model/project-zip-request';
import {PrivacyService} from '../../privacy.service';

import {ScenarioEditorService} from '../../scenario-editor.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  @ViewChild('configModal', {static: true}) configModal: TemplateRef<any>;

  openModal?: NgbModalRef;

  config: ProjectConfig;

  constructor(
    private activatedRoute: ActivatedRoute,
    private ngbModal: NgbModal,
    private router: Router,
    private scenarioEditorService: ScenarioEditorService,
    private privacyService: PrivacyService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(({config}) => {
      if (config) {
        this.config = {
          packageName: this.scenarioEditorService.packageName,
          projectName: this.scenarioEditorService.projectName,
          projectVersion: this.scenarioEditorService.projectVersion,
          scenarioFileName: this.scenarioEditorService.scenarioFileName,
          decoratorClassName: this.scenarioEditorService.decoratorClassName,
        };
        this.open();
      } else {
        this.openModal?.dismiss();
      }
    });
  }

  private open() {
    this.openModal = this.ngbModal.open(this.configModal, {ariaLabelledBy: 'config-modal-title'});
    this.openModal.hidden.subscribe(() => {
      this.router.navigate([], {queryParams: {config: null}, queryParamsHandling: 'merge'});
    });
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
