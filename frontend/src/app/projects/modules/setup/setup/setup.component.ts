import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {ProjectConfig} from '../../../../shared/model/project-config';
import {FileService} from '../../../services/file.service';
import {ProjectManager} from '../../../services/project.manager';
import {ProjectService} from '../../../services/project.service';
import {SetupService} from '../setup.service';

import {Project} from "../../../model/project";
import {Container} from "../../../model/container";
import {ContainerService} from "../../../services/container.service";

@Component({
  selector: 'app-project-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {
  config: ProjectConfig;

  project: Project;
  container: Container;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private containerService: ContainerService,
    private setupService: SetupService,

  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.projectService.get(id)),
      tap(project => {
        this.project = project;
      }),
      switchMap(project => project.local ? this.containerService.createLocal(project) : this.containerService.create(project.id)),
      tap(container => {
        this.container = container;
      }),
    ).subscribe();
    this.config = this.setupService.getDefaultConfig(this.project);
  }

  save(): void {
    this.projectService.saveConfig(this.project, this.config);
    this.projectService.generateFiles(this.container, this.config).subscribe();
  }
}
