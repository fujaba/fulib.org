import {Component, OnInit} from '@angular/core';
import {Project, ProjectStub} from '../model/project';
import {ProjectsService} from '../projects.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];

  newProject: ProjectStub = this.createProject();

  constructor(
    private projectsService: ProjectsService,
  ) {
  }

  createProject(): ProjectStub {
    return {
      name: '',
      description: '',
    };
  }

  ngOnInit(): void {
    this.projectsService.getOwn().subscribe(projects => this.projects = projects);
  }

  create(): void {
    this.projectsService.create(this.newProject).subscribe(project => this.projects.push(project));
    this.newProject = this.createProject();
  }
}
