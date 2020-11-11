export class FileStub {
  projectId: string;
  parentId: string;
  name: string;
}

export class File extends FileStub {
  id: string;
  userId: string;

  created: Date;
  modified: Date;

  data?: {
    info?: string;
    parent?: File;
    children?: File[];
  }
}
