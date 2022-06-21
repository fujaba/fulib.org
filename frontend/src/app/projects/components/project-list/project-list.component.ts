import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {forkJoin, of, Subscription} from 'rxjs';
import {catchError, filter, startWith, switchMap, tap} from 'rxjs/operators';
import {User} from '../../../user/user';
import {UserService} from '../../../user/user.service';
import {Container} from '../../model/container';
import {LocalProject, Project} from '../../model/project';
import { ContainerService } from '../../services/container.service';
import {MemberService} from '../../services/member.service';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  @ViewChild('editModal', {static: true}) editModal: TemplateRef<any>;

  currentUser?: User;

  projects: Project[] = [];
  containers: (Container | null)[] = [];

  private subscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: UserService,
    private memberService: MemberService,
    private keycloak: KeycloakService,
    private containerService: ContainerService,
  ) {
  }

  ngOnInit(): void {
    this.userService.current$.subscribe(user => user && (this.currentUser = user));

    this.subscription = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd && e.urlAfterRedirects === '/projects'),
      startWith(undefined),
      switchMap(() => this.projectService.getOwn()),
      tap(projects => this.projects = projects),
      switchMap(projects => forkJoin(projects.map(project => this.containerService.get(project.id).pipe(
        catchError(() => of(null)),
      )))),
      tap(containers => this.containers = containers),
    ).subscribe();
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

  leave(project: Project) {
    if (!confirm('Are you sure you want to leave this project as collaborator? This can only be undone by the owner.')) {
      return;
    }

    this.memberService.delete({projectId: project.id, userId: this.currentUser!.id!}).subscribe(() => {
      this.projects.removeFirst(p => p === project);
    });
  }
}
