export interface File {
  parent?: File;
  id?: string;
  name: string;
  info?: string;
  type?: string;
  children?: File[];
}
