import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import ObjectID from 'bson-objectid';
import {of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ProjectManager} from '../../project.manager';
import {LaunchService} from '../launch.service';
import {LaunchConfig, TerminalLaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnInit {

  editing: LaunchConfig = this.createNew(false);

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private launchService: LaunchService,
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({launchId}) => {
        if (launchId !== 'new') {
          return this.launchService.getLaunchConfig(this.projectManager.container, launchId);
        }
        return of(this.createNew(true));
      }),
    ).subscribe(config => {
      this.editing = config;
    });
  }

  private createNew(prefilled: boolean): TerminalLaunchConfig {
    return {
      type: 'terminal',
      name: prefilled ? 'New Terminal' : '',
      id: '',
      terminal: {
        executable: prefilled ? '/bin/bash' : '',
        workingDirectory: prefilled ? this.projectManager.fileRoot.path : '',
      },
    };
  }

  save(): void {
    const config = this.editing;
    if (!config) {
      return;
    }
    if (!config.id) {
      config.id = new ObjectID().toHexString();
    }
    this.launchService.saveLaunchConfig(this.projectManager.container, config).subscribe(() => {
      this.router.navigate(['../..'], {relativeTo: this.activatedRoute});
    });
  }
}
