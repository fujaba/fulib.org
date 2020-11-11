import {Injectable} from '@angular/core';
import {File} from './model/file';
import {FileType} from './model/file-type';

@Injectable({
  providedIn: 'root',
})
export class FileTypeService {
  readonly fileTypes: Record<string, FileType> = {
    markdown: {
      name: 'Markdown',
      extensions: ['.md'],
      icon: 'markdown',
      mode: 'text/x-markdown',
    },
    image: {
      name: 'Image',
      extensions: ['.png', '.svg'],
      icon: 'image',
      mode: 'img',
    },
    gradle: {
      name: 'Gradle',
      extensions: ['.gradle'],
      icon: 'gear',
      mode: 'text/x-groovy',
    },
    java: {
      name: 'Java',
      extensions: ['.java'],
      icon: 'file-code',
      mode: 'text/x-java',
    },
    properties: {
      name: 'Properties',
      extensions: ['.properties'],
      icon: 'file-code',
      mode: 'text/x-properties',
    },
    archive: {
      name: 'Archive',
      extensions: ['.zip', '.jar'],
      icon: 'file-zip',
      mode: 'archive',
    },
    script: {
      name: 'Script',
      extensions: ['gradlew', 'gradlew.bat'],
      icon: 'terminal',
      mode: 'text/x-sh',
    },
  };

  readonly default: FileType = {
    name: 'File',
    extensions: [],
    icon: 'file',
    mode: 'null',
  }

  getFileType(file: File): FileType {
    for (let fileType of Object.values(this.fileTypes)) {
      for (let extension of fileType.extensions) {
        if (file.name.endsWith(extension)) {
          return fileType;
        }
      }
    }
    return this.default;
  }
}
