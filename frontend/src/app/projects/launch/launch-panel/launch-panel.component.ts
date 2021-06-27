import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TerminalStub} from '../../model/terminal';
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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private launchService: LaunchService,
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.launchService.getLaunchConfigs(this.projectManager.container).subscribe(configs => {
      this.configs = configs;
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
