import {Component, Input, OnInit} from '@angular/core';
import {File} from '../../../model/file';
import {Revision} from '../../../model/revision';
import {ProjectManager} from '../../../services/project.manager';

@Component({
  selector: 'app-file-revisions',
  templateUrl: './file-revisions.component.html',
  styleUrls: ['./file-revisions.component.scss'],
})
export class FileRevisionsComponent implements OnInit {
  @Input() file?: File;
  revisions: Revision[] = [];

  constructor(
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.projectManager.currentFile.subscribe(file => this.file = file);
  }

}
