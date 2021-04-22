import { Component, OnInit } from '@angular/core';
import {Container} from '../../model/container';
import {ProjectManager} from '../../project.manager';
import {LaunchService} from '../launch.service';
import {LaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-launch-panel',
  templateUrl: './launch-panel.component.html',
  styleUrls: ['./launch-panel.component.scss']
})
export class LaunchPanelComponent implements OnInit {
  configs: LaunchConfig[] = [];

  constructor(
    private launchService: LaunchService,
    private projectManager: ProjectManager,
  ) { }

  ngOnInit(): void {
    this.launchService.getLaunchConfigs(this.projectManager.container).subscribe(configs => {
      this.configs = configs;
    });
  }

  create(): void {
    const config: LaunchConfig = {id: Math.random().toString(36), name: 'New Launch Config'};
    this.launchService.saveLaunchConfig(this.projectManager.container, config).subscribe(() => {
      this.configs.push(config);
    });
  }
}
