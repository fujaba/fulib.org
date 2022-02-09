import {saveAs} from 'file-saver';

export enum MIME_TYPES {
  html = 'application/xhtml+xml',
  yaml = 'text/plain',
  zip = 'application/zip',
}

export class FileExportHelper {
  static resToFileDownload(res: any, fileName: string, fileType: string) {
    const blob = new Blob([res], {type: fileType});
    const file = new File([blob], fileName, {type: fileType});
    saveAs(file);
  }

  static stringToFileDownload(value: string, fileName: string, fileType: string) {
    const file = new File([value], fileName, {type: fileType});
    saveAs(file);
  }
}
