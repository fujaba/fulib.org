export interface Page {
  title: string;
  url: string;
  wip: boolean;
  html?: string;
  children?: Page[];
}
