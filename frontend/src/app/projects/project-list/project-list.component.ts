import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {KeycloakService} from 'keycloak-angular';
import {Project, ProjectStub} from '../model/project';
import {ProjectService} from '../project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  @ViewChild('loginModal', {static: true}) loginModal: TemplateRef<any>;

  projects: Project[] = [];

  newProject: ProjectStub = this.createProject();

  constructor(
    private projectService: ProjectService,
    private keycloak: KeycloakService,
    private ngbModal: NgbModal,
  ) {
  }

  createProject(): ProjectStub {
    return {
      name: '',
      description: '',
    };
  }

  ngOnInit(): void {
    this.keycloak.isLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        this.ngbModal.open(this.loginModal, {
          ariaLabelledBy: 'login-modal-title',
          centered: true,
          keyboard: false,
          backdrop: 'static',
          backdropClass: 'backdrop-blur',
        });
      }

      this.projectService.getOwn().subscribe(projects => this.projects = projects);
    });
  }

  login(): void {
    this.keycloak.login().then();
  }

  create(): void {
    this.projectService.create(this.newProject).subscribe(project => this.projects.push(project));
    this.newProject = this.createProject();
  }

  delete(project: Project) {
    if (!confirm(`Are you sure you want to delete '${project.name}'? This action cannot be undone.`)) {
      return;
    }

    this.projectService.delete(project.id).subscribe(() => {
      const index = this.projects.indexOf(project);
      if (index >= 0) {
        this.projects.splice(index, 1);
      }
    });
  }
}
