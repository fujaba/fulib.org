import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalComponent, ToastService} from 'ng-bootstrap-ext';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {ConfigService} from '../../../editor/config.service';
import {ProjectConfig} from '../../../shared/model/project-config';
import {ProjectZipRequest} from '../../../shared/model/project-zip-request';

import {Project} from '../../model/project';
import {ContainerService} from '../../services/container.service';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-project-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {
  config: ProjectConfig = {
    projectName: '',
    packageName: 'org.example',
    projectVersion: '0.1.0',
    scenarioFileName: 'Scenario.md',
    decoratorClassName: 'GenModel',
  };

  project: Project;

  editor = false;
  generating = false;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private containerService: ContainerService,
    private configService: ConfigService,
    private http: HttpClient,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.projectService.get(id)),
    ).subscribe(project => {
      this.project = project;
      this.config.projectName ||= project.name.replace(/\W+/, '-').toLowerCase();
    });

    this.activatedRoute.queryParams.subscribe(({editor}) => {
      this.editor = !!editor;
      if (editor) {
        this.config = this.configService.getConfig();
      }
    });
  }

  generate(modal: ModalComponent): void {
    this.generating = true;
    const request: ProjectZipRequest = {
      ...this.config,
      scenarioText: this.editor ? this.configService.storedScenario : '',
      privacy: 'none',
    };
    forkJoin([
      this.configService.downloadZip(request),
      this.containerService.get(this.project.id),
    ]).pipe(
      switchMap(([zipBlob, container]) => {
        const formData = new FormData();
        formData.append('file', zipBlob);
        return this.http.post<void>(`${environment.projectsApiUrl}/projects/${container.projectId}/zip`, formData);
      }),
    ).subscribe(() => {
      this.generating = false;
      this.toastService.success('Setup Project', 'Successfully generated project');
      modal.close();
    }, error => {
      this.generating = false;
      this.toastService.error('Setup Project', 'Failed to generate project', error);
    });
  }
}
