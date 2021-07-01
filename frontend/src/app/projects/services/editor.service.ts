import {Injectable} from '@angular/core';
import {from} from 'rxjs';
import {concatMap, filter, map} from 'rxjs/operators';
import {PrivacyService} from '../../privacy.service';
import {FileTypeService} from './file-type.service';
import {FileService} from './file.service';
import {File} from '../model/file';
import {FileEditor} from '../model/file-editor';
import {ProjectManager} from './project.manager';

@Injectable()
export class EditorService {

  editors: FileEditor[][] = [];

  constructor(
    private privacyService: PrivacyService,
    private projectManager: ProjectManager,
    private fileService: FileService,
    private fileTypeService: FileTypeService,
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
        file.type = this.fileTypeService.default;
        return file;
      } else {
        return v;
      }
    });

    from(this.editors).pipe(
      concatMap(row => from(row)),
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
