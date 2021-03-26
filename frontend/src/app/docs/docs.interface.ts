export interface Page {
  title: string;
  repo: string;
  url: string;
  wip: boolean;
  html?: string;
  children?: Page[];
}
