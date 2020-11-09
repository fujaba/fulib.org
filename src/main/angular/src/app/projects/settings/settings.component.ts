import {Component, OnInit} from '@angular/core';
import {Project} from '../model/project';
import {ProjectsService} from '../projects.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    public project: Project,
    private projectsService: ProjectsService,
  ) {
  }

  ngOnInit(): void {
  }

  save(): void {
    this.projectsService.update(this.project).subscribe(result => Object.assign(this.project, result));
  }
}
