import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FileChangeService} from '../../file-change.service';
import {Container} from '../../model/container';
import {File} from '../../model/file';
import {ProjectManager} from '../../project.manager';

@Component({
  selector: 'app-file-image-viewer',
  templateUrl: './file-image-viewer.component.html',
  styleUrls: ['./file-image-viewer.component.scss'],
})
export class FileImageViewerComponent implements OnInit, OnDestroy {
  @Input() file: File;
  version = 0;

  container: Container;

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
