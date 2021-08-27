import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {ProjectConfig} from '../../../../model/project-config';
import {FileService} from '../../../services/file.service';
import {ProjectManager} from '../../../services/project.manager';
import {ProjectService} from '../../../services/project.service';
import {SetupService} from '../setup.service';

@Component({
  selector: 'app-project-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {
  config: ProjectConfig;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private projectManager: ProjectManager,
    private setupService: SetupService,
    private fileService: FileService,
  ) {
  }

  ngOnInit(): void {
    this.config = this.setupService.getDefaultConfig(this.projectManager.project);
  }

  save(): void {
    this.projectService.saveConfig(this.projectManager.project, this.config);
    this.projectService.generateFiles(this.projectManager.container, this.config).pipe(
      switchMap(() => {
        const {container, fileRoot} = this.projectManager;
        const path = `${fileRoot.path}src/main/scenarios/${this.config.packageName.replace('.', '/')}/${this.config.scenarioFileName}`;
        return this.fileService.resolveAsync(container, fileRoot, path);
      }),
    ).subscribe(file => {
      if (!file) {
        return;
      }
      this.projectManager.openEditor({
        file,
        preview: false,
        temporary: false,
      });
    });
  }
}
