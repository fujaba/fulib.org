import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {filter, startWith, switchMap} from 'rxjs/operators';
import {TerminalStub} from '../../../model/terminal';
import {ProjectManager} from '../../../services/project.manager';
import {LaunchService} from '../launch.service';
import {LaunchConfig} from '../model/launch-config';

@Component({
  selector: 'app-launch-panel',
  templateUrl: './launch-panel.component.html',
  styleUrls: ['./launch-panel.component.scss'],
})
export class LaunchPanelComponent implements OnInit, OnDestroy {
  configs: LaunchConfig[] = [];

  private subscription: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private launchService: LaunchService,
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.subscription = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd && e.urlAfterRedirects.includes('panel:launch)') && !e.urlAfterRedirects.includes('panel:launch/')),
      startWith(undefined),
      switchMap(() => this.launchService.getLaunchConfigs(this.projectManager.container)),
    ).subscribe(configs => {
      this.configs = configs;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
        workingDirectory: config.terminal.workingDirectory?.replace('${projectRoot}', this.projectManager.fileRoot.path),
        title: config.name,
        id: config.allowParallel ? undefined : config.id,
      };
      this.projectManager.openTerminal(terminal);
    }
  }
}
