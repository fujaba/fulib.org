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
      icon: 'file-earmark-code',
      mode: 'text/x-java',
    },
    properties: {
      name: 'Properties',
      extensions: ['.properties'],
      icon: 'file-earmark-code',
      mode: 'text/x-properties',
    },
    yaml: {
      name: 'YAML',
      extensions: ['.yaml', '.yml'],
      icon: 'file-earmark-code',
      mode: 'text/x-yaml',
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
    icon: 'file-earmark',
    mode: 'null',
  };

  getFileType(file: File): FileType {
    for (const fileType of Object.values(this.fileTypes)) {
      for (const extension of fileType.extensions) {
        if (file.name.endsWith(extension)) {
          return fileType;
        }
      }
    }
    return this.default;
  }
}
