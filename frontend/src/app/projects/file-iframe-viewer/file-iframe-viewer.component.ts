import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Container} from '../model/container';
import {File} from '../model/file';
import {ProjectManager} from '../project.manager';

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
  ) {
  }

  ngOnInit(): void {
    this.container = this.projectManager.container;
    this.subscription = this.projectManager.changes.pipe(filter(f => f === this.file)).subscribe(() => {
      this.version++;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
