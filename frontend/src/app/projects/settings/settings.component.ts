import {Component, OnInit} from '@angular/core';
import {Project} from '../model/project';
import {ProjectManager} from '../project.manager';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  project: Project;

  constructor(
    private projectManager: ProjectManager,
    private projectService: ProjectService,
  ) {
  }

  ngOnInit(): void {
    this.project = this.projectManager.project;
  }

  save(): void {
    this.projectService.update(this.project).subscribe(result => Object.assign(this.project, result));
  }
}
