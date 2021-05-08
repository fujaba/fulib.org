import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ProjectManager} from '../../project.manager';
import {LaunchService} from '../launch.service';
import {BaseLaunchConfig, LaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-launch-panel',
  templateUrl: './launch-panel.component.html',
  styleUrls: ['./launch-panel.component.scss'],
})
export class LaunchPanelComponent implements OnInit {
  @ViewChild('editModal', {static: true}) editModal: TemplateRef<any>;

  configs: LaunchConfig[] = [];

  editing?: LaunchConfig;

  constructor(
    private launchService: LaunchService,
    private projectManager: ProjectManager,
    private ngbModal: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.launchService.getLaunchConfigs(this.projectManager.container).subscribe(configs => {
      this.configs = configs;
    });
  }

  open(): void {
    this.ngbModal.open(this.editModal, {ariaLabelledBy: 'launch-config-modal-title'});
  }

  create(): void {
    this.editing = {
      type: 'terminal',
      name: 'New Terminal',
      id: Math.random().toString(36),
      terminal: {
        executable: '/bin/bash',
        workingDirectory: this.projectManager.fileRoot.path,
      },
    };
    this.open();
  }

  edit(config: LaunchConfig) {
    this.editing = config;
    this.open();
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
    this.launchService.saveLaunchConfig(this.projectManager.container, config).subscribe(() => {
      const index = this.configs.findIndex(existing => existing.id === config.id);
      if (index >= 0) {
        this.configs[index] = config;
      } else {
        this.configs.push(config);
      }
    });
  }
}
