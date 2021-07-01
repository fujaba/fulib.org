import {Injectable} from '@angular/core';
import {File} from '../model/file';
import {FileType} from '../model/file-type';

@Injectable()
export class FileTypeService {
  readonly fileTypes: Record<string, FileType> = {
    scenario: {
      name: 'Scenario',
      extensions: ['.md'],
      pathPattern: /scenarios\/.*\.md/,
      icon: 'markdown',
      mode: 'scenario',
      previewMode: 'markdown',
    },
    markdown: {
      name: 'Markdown',
      extensions: ['.md'],
      icon: 'markdown',
      mode: 'text/x-markdown',
      previewMode: 'markdown',
    },
    png: {
      name: 'PNG Image',
      extensions: ['.png'],
      icon: 'image',
      mode: 'img',
    },
    svg: {
      name: 'SVG Image',
      extensions: ['.svg'],
      icon: 'image',
      mode: 'text/xml',
      previewMode: 'img',
    },
    html: {
      name: 'HTML',
      extensions: ['.htm', '.html'],
      icon: 'file-earmark-richtext',
      mode: 'text/html',
      previewMode: 'iframe',
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
