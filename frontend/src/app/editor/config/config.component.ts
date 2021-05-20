import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';

import {PrivacyService} from '../../privacy.service';
import {ProjectConfig} from '../../shared/model/project-config';
import {ProjectZipRequest} from '../../shared/model/project-zip-request';
import {ConfigService} from '../config.service';
import {EditorService} from '../editor.service';

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
    private editorService: EditorService,
    private configService: ConfigService,
    private privacyService: PrivacyService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(({config}) => {
      if (config) {
        this.config = {
          packageName: this.configService.packageName,
          projectName: this.configService.projectName,
          projectVersion: this.configService.projectVersion,
          scenarioFileName: this.configService.scenarioFileName,
          decoratorClassName: this.configService.decoratorClassName,
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
    this.configService.packageName = this.config.packageName;
    this.configService.projectName = this.config.projectName;
    this.configService.projectVersion = this.config.projectVersion;
    this.configService.scenarioFileName = this.config.scenarioFileName;
    this.configService.decoratorClassName = this.config.decoratorClassName || '';
  }

  downloadProjectZip(): void {
    const request: ProjectZipRequest = {
      ...this.config,
      privacy: this.privacyService.privacy || 'none',
      scenarioText: this.editorService.storedScenario,
    };
    this.configService.downloadZip(request).subscribe(blob => {
      saveAs(blob, `${this.config.projectName}.zip`);
    });
  }
}
