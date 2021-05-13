import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {combineLatest, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {TerminalStub} from '../../model/terminal';
import {ProjectManager} from '../../project.manager';
import {LaunchService} from '../launch.service';
import {LaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-launch-panel',
  templateUrl: './launch-panel.component.html',
  styleUrls: ['./launch-panel.component.scss'],
})
export class LaunchPanelComponent implements OnInit, OnDestroy {
  @ViewChild('editModal', {static: true}) editModal: TemplateRef<any>;

  openModal?: NgbModalRef;

  configs: LaunchConfig[] = [];

  editing?: LaunchConfig;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private launchService: LaunchService,
    private projectManager: ProjectManager,
    private ngbModal: NgbModal,
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.launchService.getLaunchConfigs(this.projectManager.container).pipe(catchError(() => of([]))),
      this.activatedRoute.queryParams.pipe(map(({launchConfig}) => launchConfig)),
    ]).subscribe(([configs, launchConfigId]) => {
      this.configs = configs;
      if (launchConfigId === 'new') {
        this.create();
      } else if (launchConfigId) {
        const launchConfig = this.configs.find(l => l.id === launchConfigId);
        if (launchConfig) {
          this.edit(launchConfig);
        }
      } else {
        this.editing = undefined;
        this.openModal?.dismiss();
      }
    });
  }

  ngOnDestroy(): void {
    this.openModal?.dismiss();
  }

  create(): void {
    this.edit({
      type: 'terminal',
      name: 'New Terminal',
      id: '',
      terminal: {
        executable: '/bin/bash',
        workingDirectory: this.projectManager.fileRoot.path,
      },
    });
  }

  edit(config: LaunchConfig) {
    this.editing = config;
    this.openModal = this.ngbModal.open(this.editModal, {
      ariaLabelledBy: 'launch-config-modal-title',
    });
    this.openModal.hidden.subscribe(() => {
      this.router.navigate([], {queryParams: {launchConfig: null}, queryParamsHandling: 'merge'});
    });
  }

  delete(config: LaunchConfig) {
    if (!confirm(`Are you sure you want to delete '${config.name}?`)) {
      return;
    }

    this.launchService.deleteLaunchConfig(this.projectManager.container, config).subscribe(() => {
      const index = this.configs.indexOf(config);
      if (index >= 0) {
        this.configs.splice(index, 1);
      }
      if (config === this.editing) {
        this.editing = undefined;
      }
    });
  }

  save(): void {
    const config = this.editing;
    if (!config) {
      return;
    }
    if (!config.id) {
      config.id = Math.random().toString(36);
    }
    this.launchService.saveLaunchConfig(this.projectManager.container, config).subscribe(() => {
      const index = this.configs.findIndex(existing => existing.id === config.id);
      if (index >= 0) {
        this.configs[index] = config;
      } else {
        this.configs.push(config);
      }
    });
  }

  launch(config: LaunchConfig) {
    if (config.type === 'terminal') {
      const terminal: TerminalStub = {
        ...config.terminal,
        title: config.name,
        id: config.allowParallel ? undefined : config.id,
      };
      this.projectManager.openTerminal(terminal);
    }
  }
}
