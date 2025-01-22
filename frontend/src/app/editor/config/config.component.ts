import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';

import {PrivacyService} from '../../services/privacy.service';
import {ProjectConfig} from '../../shared/model/project-config';
import {ProjectZipRequest} from '../../shared/model/project-zip-request';
import {ConfigService} from '../config.service';

const formats = [
  {
    id: 'gradle',
    name: 'Gradle Project',
    description: 'You can download your scenario prepared as a Gradle project. ' +
      'Just extract the downloaded Zip file to a folder and open it with your favorite IDE. ' +
      'Make sure to run the <code>check</code> task afterwards to generate Java classes and execute the tests. ',
  },
  {
    id: 'project',
    name: 'Online Project',
    description: 'Create a new Online Project from the scenario and configuration. ' +
      'The Project will appear in the Projects tab and is bound to your user account. ' +
      'You will be able to access it from anywhere just by logging in. ',
  },
] as const;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  standalone: false,
})
export class ConfigComponent implements OnInit {
  config: ProjectConfig;

  formats = formats;

  format: (typeof formats)[number] = formats[0];

  constructor(
    private ngbModal: NgbModal,
    public route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private privacyService: PrivacyService,
  ) {
  }

  ngOnInit(): void {
    this.config = this.configService.getConfig();
  }

  save(): void {
    this.configService.saveConfig(this.config);
  }

  export(): void {
    switch (this.format?.id) {
      case 'gradle':
        return this.downloadProjectZip();
      case 'project':
        return this.createProject();
    }
  }

  downloadProjectZip(): void {
    const request: ProjectZipRequest = {
      ...this.config,
      privacy: this.privacyService.privacy ?? 'none',
      scenarioText: this.configService.storedScenario,
    };
    this.configService.downloadZip(request).subscribe(blob => {
      saveAs(blob, `${this.config.projectName}.zip`);
    });
  }

  private createProject() {
    this.save();
    this.router.navigate(['/projects/new/edit'], {
      queryParams: {
        editor: true,
      },
    });
  }
}
