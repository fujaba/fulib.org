import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {ProjectConfig} from '../../../shared/model/project-config';
import {Container} from '../../model/container';

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
  container: Container;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private containerService: ContainerService,
  ) {
  }

  ngOnInit(): void {
    const id$ = this.activatedRoute.params.pipe(map(({id}) => id));
    id$.pipe(
      switchMap(id => this.projectService.get(id)),
    ).subscribe(project => {
      this.project = project;
      this.config.projectName = project.name.replace(/\W+/, '-').toLowerCase();
    });

    id$.pipe(
      switchMap(id => this.containerService.get(id)),
    ).subscribe(container => this.container = container);
  }

  save(): void {
    this.projectService.generateFiles(this.container, this.config).subscribe();
  }
}
