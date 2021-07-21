import {Component, Input} from '@angular/core';
import {Container} from '../../../model/container';
import {File} from '../../../model/file';
import {ProjectManager} from '../../../services/project.manager';

@Component({
  selector: 'app-file-download-viewer',
  templateUrl: './file-download-viewer.component.html',
  styleUrls: ['./file-download-viewer.component.scss'],
})
export class FileDownloadViewerComponent {
  @Input() file: File;
  container: Container;

  constructor(
    projectManager: ProjectManager,
  ) {
    this.container = projectManager.container;
  }
}
