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
  modified: Date;

  data?: {
    content?: string;
    info?: string;
    parent?: File;
    children?: File[];
  }
}
