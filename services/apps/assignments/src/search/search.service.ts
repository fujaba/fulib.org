import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {randomUUID} from 'crypto';
import {Location, Snippet} from '../evaluation/evaluation.schema';

interface FileDocument {
  assignment: string;
  solution: string;
  file: string;
  content: string;
}

interface SearchResult {
  assignment: string;
  solution: string;
  snippets: Snippet[];
}

@Injectable()
export class SearchService {
  constructor(
    private elasticsearchService: ElasticsearchService,
  ) {
  }

  async addFile(assignment: string, solution: string, file: string, content: string) {
    const body: FileDocument = {
      assignment,
      solution,
      file,
      content,
    };
    await this.elasticsearchService.index({
      index: 'files',
      id: `${assignment}/${solution}/${file}`,
      body,
    });
  }

  async find(assignment: string, snippet: string): Promise<SearchResult[]> {
    const uniqueId = randomUUID();
    const result = await this.elasticsearchService.search({
      index: 'files',
      body: {
        query: {
          bool: {
            must: {
              match_phrase: {
                content: {
                  query: snippet,
                  slop: 4,
                },
              },
            },
            filter: [{
              term: {
                assignment,
              },
            }],
          },
        },
        highlight: {
          fields: {
            content: {},
          },
          pre_tags: [uniqueId],
          post_tags: [uniqueId],
        },
      },
    });
    return result.body.hits.hits.map((hit: any) => this._convertHit(hit, uniqueId));
  }

  _convertHit(hit: { _source: FileDocument, highlight: string }, uniqueId: string): SearchResult {
    const {assignment, solution, file, content} = hit._source;
    const highlight = hit.highlight;
    const lineStartIndices = this._buildLineStartList(content);
    const split = highlight.split(uniqueId);
    let start = 0;
    const snippets: Snippet[] = [];

    for (let i = 1; i < split.length; i += 2) {
      start += split[i - 1].length;

      const code = split[i];
      const end = start + code.length;
      const from = this._findLocation(lineStartIndices, start);
      const to = this._findLocation(lineStartIndices, end);

      snippets.push({
        file,
        code,
        comment: '',
        from,
        to,
      });

      start = end;
    }

    return {assignment, solution, snippets};
  }

  _findLocation(lineStarts: number[], start: number): Location {
    // TODO may have off-by-one-errors
    let line = lineStarts.findIndex(c => c > start) - 1;
    if (line < 0) {
      line = lineStarts.length - 1;
    }
    const character = start - lineStarts[line];
    return {
      line,
      character,
    };
  }

  _buildLineStartList(source: string): number[] {
    const result: number[] = [0];
    let index = -1;
    while ((index = source.indexOf('\n', index + 1)) >= 0) {
      result.push(index + 1);
    }
    return result;
  }
}
