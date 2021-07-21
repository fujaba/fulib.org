import {Injectable} from '@angular/core';
import {File} from '../model/file';
import {FileType} from '../model/file-type';
import {DEFAULT, FILE_TYPES} from '../model/file-type.constants';

@Injectable()
export class FileTypeService {
  readonly fileTypes = FILE_TYPES;
  readonly default = DEFAULT;

  getFileType(file: File): FileType {
    const name = file.name;
    for (const fileType of Object.values(this.fileTypes)) {
      for (const extension of fileType.extensions) {
        if (name.endsWith(extension) && (!fileType.pathPattern || fileType.pathPattern.test(file.path))) {
          return fileType;
        }
      }
    }
    return this.default;
  }
}
