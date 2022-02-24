import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectManager} from '../../services/project.manager';

@Component({
  selector: 'app-run-anything',
  templateUrl: './run-anything.component.html',
  styleUrls: ['./run-anything.component.scss'],
})
export class RunAnythingComponent {

  constructor(
    public route: ActivatedRoute,
    private projectManager: ProjectManager,
  ) {
  }

  run(value: string) {
    this.projectManager.openTerminal({
      executable: '/bin/bash',
      arguments: ['-c', value],
      workingDirectory: this.projectManager.fileRoot.path,
    });
  }
}
