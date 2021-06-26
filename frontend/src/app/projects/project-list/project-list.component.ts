import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {LocalProject, Project} from '../model/project';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  @ViewChild('editModal', {static: true}) editModal: TemplateRef<any>;

  loggedIn = false;

  projects: Project[] = [];
  deleting = new Set<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private keycloak: KeycloakService,
  ) {
  }

  ngOnInit(): void {
    this.keycloak.isLoggedIn().then(loggedIn => this.loggedIn = loggedIn);

    this.projectService.getOwn().subscribe(projects => {
      this.projects = projects;
    });
  }

  convert(localProject: LocalProject) {
    this.projectService.convert(localProject).subscribe(persistentProject => {
      const index = this.projects.indexOf(localProject);
      if (index >= 0) {
        this.projects[index] = persistentProject;
      }
    });
  }

  delete(project: Project) {
    if (!confirm(`Are you sure you want to delete '${project.name}'? This action cannot be undone.`)) {
      return;
    }

    this.deleting.add(project.id);
    this.projectService.delete(project).subscribe(() => {
      this.deleting.delete(project.id);
      const index = this.projects.indexOf(project);
      if (index >= 0) {
        this.projects.splice(index, 1);
      }
    });
  }
}
