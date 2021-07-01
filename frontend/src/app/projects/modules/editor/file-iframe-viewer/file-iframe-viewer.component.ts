import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FileChangeService} from '../../../services/file-change.service';
import {Container} from '../../../model/container';
import {File} from '../../../model/file';
import {ProjectManager} from '../../../services/project.manager';

@Component({
  selector: 'app-file-iframe-viewer',
  templateUrl: './file-iframe-viewer.component.html',
  styleUrls: ['./file-iframe-viewer.component.scss'],
})
export class FileIframeViewerComponent implements OnInit, OnDestroy {
  @Input() file: File;

  container: Container;

  version = 0;

  subscription: Subscription;

  constructor(
    private projectManager: ProjectManager,
    private fileChangeService: FileChangeService,
  ) {
  }

  ngOnInit(): void {
    this.container = this.projectManager.container;
    this.subscription = this.fileChangeService.watch(this.projectManager, this.file).subscribe(() => {
      this.version++;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
