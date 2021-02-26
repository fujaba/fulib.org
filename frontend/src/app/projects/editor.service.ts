import {Injectable} from '@angular/core';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {concatMap, filter, map} from 'rxjs/operators';
import {PrivacyService} from '../privacy.service';
import {FileService} from './file.service';
import {File} from './model/file';
import {FileEditor} from './model/file-editor';
import {ProjectManager} from './project.manager';

@Injectable()
export class EditorService {

  editors: FileEditor[][] = [];

  constructor(
    private privacyService: PrivacyService,
    private projectManager: ProjectManager,
    private fileService: FileService,
  ) {
  }

  loadEditors() {
    const stored = this.privacyService.getStorage(`projects/${this.projectManager.project.id}/editors`);
    if (!stored) {
      return;
    }

    this.editors = JSON.parse(stored, (k, v) => {
      if (k === 'file') {
        const file = new File();
        file.path = v;
        return file;
      } else {
        return v;
      }
    });

    fromArray(this.editors).pipe(
      concatMap(row => fromArray(row)),
      concatMap(editor => this.fileService.resolveAsync(this.projectManager.container, this.projectManager.fileRoot, editor.file.path).pipe(
        filter((file): file is File => file !== undefined),
        map(file => ({editor, file})),
      )),
    ).subscribe(({editor, file}) => {
      editor.file = file;
    });
  }

  saveEditors() {
    this.privacyService.setStorage(`projects/${this.projectManager.project.id}/editors`, JSON.stringify(this.editors));
  }
}
