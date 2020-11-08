export interface File {
  parent?: File;
  id?: string;
  name: string;
  info?: string;
  children?: File[];
}
