export class File {
  path: string;

  modified: Date;

  content?: string;
  dirty?: boolean;
  info?: string;
  parent?: File;
  children?: File[];

  get _namePos(): [number, number] {
    const end = this.path.length - (this.directory ? 1 : 0);
    const start = this.path.lastIndexOf('/', end - 1) + 1;
    return [start, end];
  }

  get parentPath(): string {
    const [start] = this._namePos;
    return this.path.substring(0, start);
  }

  get name(): string {
    const [start, end] = this._namePos;
    return this.path.substring(start, end);
  }

  get directory(): boolean {
    return this.path.endsWith('/');
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
