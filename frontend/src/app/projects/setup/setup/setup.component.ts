import {Component, Input, OnInit} from '@angular/core';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ProjectConfig} from '../../../model/project-config';
import {ProjectManager} from '../../project.manager';
import {SetupService} from '../setup.service';

@Component({
  selector: 'app-project-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit {
  @Input() modal: NgbModalRef;

  saving = false;

  config: ProjectConfig;

  constructor(
    private projectManager: ProjectManager,
    private setupService: SetupService,
  ) {
  }

  ngOnInit(): void {
    this.config = this.setupService.getDefaultConfig(this.projectManager.project);
  }

  save(): void {
    this.saving = true;
    this.setupService.generateFiles(this.projectManager.container, this.config).subscribe(() => {
      this.saving = false;
      this.modal.close();
    });
  }
}
