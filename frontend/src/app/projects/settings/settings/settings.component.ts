import {Component, Inject, OnInit, Optional} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Project} from '../../model/project';
import {ProjectManager} from '../../project.manager';
import {ProjectService} from '../../project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  project: Project;

  constructor(
    public activatedRoute: ActivatedRoute,
    @Optional() public projectManager: ProjectManager | null,
    private projectService: ProjectService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.projectService.get(id)),
    ).subscribe(project => {
      this.project = project;
    });
  }

  save(): void {
    this.projectService.update(this.project).subscribe(result => this.project = result);
  }
}
