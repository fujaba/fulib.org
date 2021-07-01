import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
import {map, switchMap} from 'rxjs/operators';
import {Project, ProjectStub} from '../../model/project';
import {ProjectService} from '../../project.service';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnInit {

  editing: Project | ProjectStub = this.createNew();
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
        return this.activatedRoute.queryParams.pipe(map(({editor, local}) => {
          this.creatingFromEditor = !!editor;
          return this.createNew(!!local);
        }));
      }),
    ).subscribe(project => {
      this.editing = project;
    });
  }

  private createNew(local?: boolean): ProjectStub {
    return {
      name: '',
      description: '',
      local,
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
        this.projectService.setupFromEditor(created.id);
      }
      this.router.navigate(['/projects']);
    });
  }
}
