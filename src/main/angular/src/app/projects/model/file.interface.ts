export interface File {
  parent?: File;
  id?: string;
  name: string;
  children?: File[];
}
