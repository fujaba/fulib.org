import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, EMPTY} from 'rxjs';
import {filter, startWith, switchMap} from 'rxjs/operators';
import {MarkdownService} from '../../markdown.service';
import {FileService} from '../file.service';
import {File} from '../model/file';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-file-markdown-viewer',
  templateUrl: './file-markdown-viewer.component.html',
  styleUrls: ['./file-markdown-viewer.component.scss'],
})
export class FileMarkdownViewerComponent implements OnInit, OnDestroy {
  private file$ = new BehaviorSubject<File | undefined>(undefined);

  rendered = '';

  constructor(
    private projectManager: ProjectManager,
    private fileService: FileService,
    private markdownService: MarkdownService,
  ) {
  }

  @Input() set file(file: File) {
    this.file$.next(file);
  }

  ngOnInit(): void {
    this.file$.pipe(
      switchMap(file => file ? this.projectManager.changes.pipe(filter(f => f === file), startWith(file)) : EMPTY),
      switchMap(file => this.fileService.getContent(this.projectManager.container, file)),
      switchMap(content => this.markdownService.renderMarkdown(content)),
    ).subscribe(content => {
      this.rendered = content;
    });
  }

  ngOnDestroy(): void {
    this.file$.unsubscribe();
  }
}
