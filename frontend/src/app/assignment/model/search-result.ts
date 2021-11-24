import {Snippet} from './evaluation';

export interface SearchResult {
  assignment: string;
  solution: string;
  snippets: (Snippet & { context: string })[];
}
