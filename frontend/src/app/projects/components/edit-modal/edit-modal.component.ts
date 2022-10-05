import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CreateProjectDto, Project} from '../../model/project';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnInit {

  editing: Project | CreateProjectDto = this.createNew();
  creatingFromEditor = false;
  loggedIn = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private keycloakService: KeycloakService,
  ) {
  }

  ngOnInit(): void {
    this.keycloakService.isLoggedIn().then(loggedIn => this.loggedIn = loggedIn);
    this.activatedRoute.params.pipe(
      switchMap(({id}) => {
        if (id !== 'new') {
          return this.projectService.get(id);
        }
        return of(this.createNew());
      }),
    ).subscribe(project => {
      this.editing = project;
    });

    this.activatedRoute.queryParams.subscribe(({editor}) => {
      this.creatingFromEditor = !!editor;
    });
  }

  private createNew(): CreateProjectDto {
    return {
      name: '',
      description: '',
    };
  }

  login(): void {
    this.keycloakService.login();
  }

  save(): void {
    if (!this.editing) {
      return;
    }
    if ('id' in this.editing) {
      this.projectService.update(this.editing).subscribe();
      return;
    }

    this.projectService.create(this.editing).subscribe(created => {
      if (this.creatingFromEditor) {
        // TODO
      }
      this.router.navigate(['/projects']);
    });
  }
}
