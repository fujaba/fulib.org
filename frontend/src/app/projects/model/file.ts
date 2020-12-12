import {Revision} from './revision';

export class FileStub {
  projectId: string;
  parentId: string;
  name: string;
  directory: boolean;
}

export class File extends FileStub {
  id: string;
  userId: string;

  created: Date;
  revisions: Revision[];

  data?: {
    content?: string;
    dirty?: boolean;
    info?: string;
    parent?: File;
    children?: File[];
  }

  static compare(a: File, b: File): number {
    if (a.directory && !b.directory) {
      return -1;
    }
    if (!a.directory && b.directory) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }
}
