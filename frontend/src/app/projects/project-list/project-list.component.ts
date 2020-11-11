import {Component, OnInit} from '@angular/core';
import {Project, ProjectStub} from '../model/project';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];

  newProject: ProjectStub = this.createProject();

  constructor(
    private projectService: ProjectService,
  ) {
  }

  createProject(): ProjectStub {
    return {
      name: '',
      description: '',
    };
  }

  ngOnInit(): void {
    this.projectService.getOwn().subscribe(projects => this.projects = projects);
  }

  create(): void {
    this.projectService.create(this.newProject).subscribe(project => this.projects.push(project));
    this.newProject = this.createProject();
  }
}
