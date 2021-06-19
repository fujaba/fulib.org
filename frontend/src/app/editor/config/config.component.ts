import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';

import {PrivacyService} from '../../privacy.service';
import {ProjectConfig} from '../../shared/model/project-config';
import {ProjectZipRequest} from '../../shared/model/project-zip-request';
import {ConfigService} from '../config.service';
import {EditorService} from '../editor.service';

type Format = 'gradle' | 'local' | 'persistent';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  @ViewChild('configModal', {static: true}) configModal: TemplateRef<any>;

  openModal?: NgbModalRef;

  config: ProjectConfig;

  formats = [
    {
      id: 'gradle',
      name: 'Gradle Project',
      description: 'You can download your scenario prepared as a Gradle project. ' +
        'Just extract the downloaded Zip file to a folder and open it with your favorite IDE. ' +
        'Make sure to run the <code>check</code> task afterwards to generate Java classes and execute the tests. ',
    },
    {
      id: 'local',
      name: 'Local Project',
      description: 'Create a new local Project from the scenario and config. ' +
        'The Project will appear in the Projects tab and is stored in your browser. ' +
        '<span class="badge badge-primary">New</span>',
    },
    {
      id: 'persistent',
      name: 'Persistent Project',
      description: 'Create a new persistent Project from the scenario and config. ' +
        'The Project will appear in the Projects tab and is bound to your user account. ' +
        'You will be able to access it from anywhere just by logging in. ' +
        '<span class="badge badge-primary">New</span>',
    },
  ];

  format?: Format;

  formatMatcher = ({id}) => id === this.format;

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

  export(): void {
    switch (this.format) {
      case 'gradle':
        return this.downloadProjectZip();
      case 'local':
        return this.createProject(true);
      case 'persistent':
        return this.createProject(false);
    }
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

  private createProject(local: boolean) {
    this.save();
    this.router.navigate(['/projects'], {
      queryParams: {
        edit: 'new',
        local: local ? true : undefined,
        editor: true,
      },
    });
  }
}
