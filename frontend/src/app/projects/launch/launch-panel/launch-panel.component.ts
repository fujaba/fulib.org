import {Component, OnInit, TemplateRef} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ProjectManager} from '../../project.manager';
import {LaunchService} from '../launch.service';
import {LaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-launch-panel',
  templateUrl: './launch-panel.component.html',
  styleUrls: ['./launch-panel.component.scss'],
})
export class LaunchPanelComponent implements OnInit {
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

  open(content: TemplateRef<any>, ariaLabelledBy: string): void {
    this.ngbModal.open(content, {ariaLabelledBy});
  }

  create(): void {
    this.editing = {
      type: 'terminal',
      name: 'New Terminal',
      id: Math.random().toString(36),
      terminal: {
        executable: '/bin/bash',
      },
    };
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
