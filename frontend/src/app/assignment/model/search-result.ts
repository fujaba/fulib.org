import {Snippet} from './evaluation';

export interface SearchResult {
  assignment: string;
  solution: string;
  snippets: Snippet[];
}

export interface SearchSummary {
  solutions: number;
  files: number;
  hits: number;
}
