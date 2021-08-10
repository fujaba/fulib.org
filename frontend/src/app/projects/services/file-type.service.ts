import {Injectable} from '@angular/core';
import {File} from '../model/file';
import {FileType} from '../model/file-type';
import {DEFAULT, FILE_TYPES} from '../model/file-type.constants';

@Injectable()
export class FileTypeService {
  getFileType(file: File): FileType {
    const name = file.name;
    let matchedLength = 0;
    let matchedType = DEFAULT;
    for (const fileType of Object.values(FILE_TYPES)) {
      const pattern = fileType.pathPattern;
      if (pattern) {
        if (pattern.source.length > matchedLength && pattern.test(file.path)) {
          matchedType = fileType;
        }
        continue;
      }
      for (const extension of fileType.extensions) {
        if (extension.length > matchedLength && name.endsWith(extension)) {
          matchedType = fileType;
        }
      }
    }
    return matchedType;
  }
}
