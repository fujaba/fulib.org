import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, EMPTY} from 'rxjs';
import {map, mapTo, startWith, switchMap} from 'rxjs/operators';
import {MarkdownService} from '../../../../services/markdown.service';
import {FileChangeService} from '../../../services/file-change.service';
import {FileService} from '../../../services/file.service';
import {File} from '../../../model/file';
import {ProjectManager} from '../../../services/project.manager';

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
    private fileChangeService: FileChangeService,
  ) {
  }

  @Input() set file(file: File) {
    this.file$.next(file);
  }

  ngOnInit(): void {
    this.file$.pipe(
      switchMap(file => file ? this.fileChangeService.watch(this.projectManager, file).pipe(mapTo(file), startWith(file)) : EMPTY),
      switchMap(file => this.fileService.getContent(this.projectManager.container, file).pipe(map(content => [file, content] as const))),
      switchMap(([file, content]) => this.markdownService.renderMarkdown(content, {
        imageBaseUrl: `${this.projectManager.container.url}/dav/${file.parentPath}`,
      })),
    ).subscribe(content => {
      this.rendered = content;
    });
  }

  ngOnDestroy(): void {
    this.file$.unsubscribe();
  }
}
