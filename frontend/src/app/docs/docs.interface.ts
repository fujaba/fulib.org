export interface Page {
  title: string;
  repo: string;
  url: string;
  wip: boolean;
}

export interface ParsedPage extends Page {
  markdown: string;
  children: Page[];
}

export interface RenderedPage extends ParsedPage {
  html: string;
}

export interface Repository {
  name: string;
  description: string;
}
