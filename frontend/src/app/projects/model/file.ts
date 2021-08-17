import {FileType} from './file-type';

export class File {
  dirty?: boolean;
  info?: string;
  parent?: File;
  children?: File[];

  constructor(
    public path: string,
    public type: FileType,
    public modified: Date,
  ) {
  }

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

  setChildren(children: File[]) {
    if (!this.children) {
      children.sort(File.compare);
      for (const child of children) {
        child.parent = this;
      }
      this.children = children;
      return;
    }

    const mergedChildren: File[] = [];
    const newPaths = new Map(children.map(child => [child.path, child]));
    const oldPaths = new Set(this.children.map(child => child.path));

    for (const newChild of children) {
      if (!oldPaths.has(newChild.path)) {
        // file was created
        newChild.parent = this;
        mergedChildren.push(newChild);
      }
    }

    for (const oldChild of this.children) {
      const newChild = newPaths.get(oldChild.path);
      if (newChild) {
        // file was modified
        oldChild.modified = newChild.modified;
        mergedChildren.push(oldChild);
      } else {
        // file was deleted
        oldChild.parent = undefined;
      }
    }

    mergedChildren.sort(File.compare);
    this.children = mergedChildren;
  }

  resolve(path: string): File | undefined {
    if (this.path === path || this.path === path + '/') {
      return this;
    }
    if (!this.children || !path.startsWith(this.path)) {
      return undefined;
    }
    for (const child of this.children) {
      const childResult = child.resolve(path);
      if (childResult) {
        return childResult;
      }
    }
    return undefined;
  }

  toJSON() {
    return this.path;
  }
}
