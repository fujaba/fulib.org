export class FileType {
  name: string;
  extensions: string[];
  pathPattern?: RegExp;
  icon: string;
  mode: string;
  previewMode?: string;
}
