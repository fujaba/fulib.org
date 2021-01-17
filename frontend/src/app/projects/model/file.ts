import {FileType} from './file-type';

export class File {
  path: string;

  modified: Date;
  type: FileType;

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
    // TODO this method is called VERY often, figure out a way to make it faster
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

  setParent(parent: File): void {
    this.removeFromParent();

    this.parent = parent;
    if (parent.children) {
      this.insertSorted(parent.children, this);
    }
  }

  private insertSorted(parentChildren: File[], file: File) {
    // TODO binary search
    const index = parentChildren.findIndex(f => File.compare(f, file) > 0);
    if (index >= 0) {
      parentChildren.splice(index, 0, file);
    } else {
      parentChildren.push(file);
    }
  }

  removeFromParent(): void {
    const parentChildren = this.parent?.children;
    if (parentChildren) {
      const index = parentChildren.indexOf(this);
      parentChildren.splice(index, 1);
    }
    this.parent = undefined;
  }

  toJSON() {
    return this.path;
  }
}
