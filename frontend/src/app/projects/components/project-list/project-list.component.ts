import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {Subscription} from 'rxjs';
import {filter, startWith, switchMap} from 'rxjs/operators';
import {LocalProject, Project} from '../../model/project';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  @ViewChild('editModal', {static: true}) editModal: TemplateRef<any>;

  loggedIn = false;

  projects: Project[] = [];

  private subscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private keycloak: KeycloakService,
  ) {
  }

  ngOnInit(): void {
    this.keycloak.isLoggedIn().then(loggedIn => this.loggedIn = loggedIn);

    this.subscription = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd && e.urlAfterRedirects === '/projects'),
      startWith(undefined),
      switchMap(() => this.projectService.getOwn()),
    ).subscribe(projects => {
      this.projects = projects;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  login(): void {
    this.keycloak.login();
  }

  convert(localProject: LocalProject) {
    this.projectService.convert(localProject).subscribe(persistentProject => {
      const index = this.projects.indexOf(localProject);
      if (index >= 0) {
        this.projects[index] = persistentProject;
      }
    });
  }
}
