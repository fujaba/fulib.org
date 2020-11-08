import {Component, OnInit} from '@angular/core';
import {Project} from '../model/project.interface';
import {ProjectsService} from '../projects.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];

  name = '';
  description = '';

  constructor(
    private projectsService: ProjectsService,
  ) {
  }

  ngOnInit(): void {
    this.projectsService.getOwn().subscribe(projects => this.projects = projects);
  }

  create(): void {
    this.projectsService.create({
      name: this.name,
      description: this.description,
    }).subscribe(project => this.projects.push(project));
    this.name = '';
    this.description = '';
  }
}
