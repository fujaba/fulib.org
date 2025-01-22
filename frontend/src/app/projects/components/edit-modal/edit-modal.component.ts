import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {ToastService} from '@mean-stream/ngbx';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CreateProjectDto, Project} from '../../model/project';
import {ProjectService} from '../../services/project.service';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
  standalone: false,
})
export class EditModalComponent implements OnInit {

  editing: Project | CreateProjectDto = this.createNew();
  creatingFromEditor = false;
  loggedIn = false;
  saving = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private keycloakService: KeycloakService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.loggedIn = this.keycloakService.isLoggedIn();
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

    this.saving = true;
    ('id' in this.editing ? this.projectService.update(this.editing) : this.projectService.create(this.editing)).subscribe(created => {
      this.saving = false;
      if (this.creatingFromEditor) {
        this.router.navigate(['/projects', created.id, 'setup'], {queryParams: {editor: true}});
      } else {
        this.router.navigate(['/projects']);
      }
    }, error => {
      this.saving = false;
      this.toastService.error(`${'id' in this.editing ? 'Update' : 'Create'} Project`, `Failed to ${'id' in this.editing ? 'update' : 'create'} project`, error);
    });
  }
}
