import {Injectable, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {randomUUID} from 'crypto';
import {isDeepStrictEqual} from 'util';
import {Location} from '../evaluation/evaluation.schema';
import {SearchSummary, SearchParams, SearchResult, SearchSnippet} from './search.dto';

interface FileDocument {
  assignment: string;
  solution: string;
  file: string;
  content: string;
}

const TOKEN_PATTERN = new RegExp(Object.values({
  number: /[+-]?[0-9]+(\.[0-9]+)?/,
  string: /["](\\\\|\\["]|[^"])*["]/,
  char: /'(\\\\|\\'|[^'])*'/,
  identifier: /[a-zA-Z$_][a-zA-Z0-9$_]*/,
  symbol: /[(){}<>\[\].,;+\-*/%|&=!?:@^]/,
}).map(r => r.source).join('|'));

@Injectable()
export class SearchService implements OnModuleInit {
  constructor(
    private elasticsearchService: ElasticsearchService,
  ) {
  }

  async onModuleInit() {
    const files = await this.elasticsearchService.indices.get({
      index: 'files',
    }).catch(() => null);

    const expectedAnalysis = {
      analyzer: {
        code: {
          tokenizer: 'code',
        },
      },
      tokenizer: {
        code: {
          type: 'simple_pattern',
          pattern: TOKEN_PATTERN.source,
        },
      },
    };

    const expectedContent = {
      type: 'text',
      analyzer: 'code',
      term_vector: 'with_positions_offsets',
    };

    const newName = 'files-' + Date.now();

    if (files) {
      const {0: oldName, 1: oldData} = Object.entries(files.body)[0];

      const actualContent = oldData.mappings?.properties?.content;
      const actualAnalysis = oldData.settings?.index?.analysis;
      if (isDeepStrictEqual(expectedContent, actualContent) && isDeepStrictEqual(actualAnalysis, expectedAnalysis)) {
        return;
      }

      console.info('Migrating file index:', oldName, '->', newName);

      await this.createIndex(newName, expectedContent, expectedAnalysis);

      // transfer data from old index to new index
      await this.elasticsearchService.reindex({
        body: {
          source: {
            index: oldName,
          },
          dest: {
            index: newName,
          },
        },
      });

      // add alias from 'files' to newName
      await this.elasticsearchService.indices.updateAliases({
        body: {
          actions: [
            {remove_index: {index: oldName}},
            {add: {index: newName, alias: 'files'}},
          ],
        },
      });

      // delete old index
      await this.elasticsearchService.indices.delete({
        index: oldName,
      });
    } else {
      console.info('Creating file index:', newName);
      await this.createIndex(newName, expectedContent, expectedAnalysis);

      // add alias 'files' -> newName
      await this.elasticsearchService.indices.putAlias({
        name: 'files',
        index: newName,
      });
    }
  }

  private async createIndex(newName: string, expectedContent: any, expectedAnalysis: any) {
    await this.elasticsearchService.indices.create({
      index: newName,
      body: {
        mappings: {
          properties: {
            content: expectedContent,
          },
        },
        settings: {
          analysis: expectedAnalysis,
        },
      },
    });
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

  async findSummary(assignment: string, params: SearchParams): Promise<SearchSummary> {
    const {uniqueId, result} = await this._search(assignment, params, ['solution']);
    const hitsContainer = result.body.hits;
    const solutions = new Set(hitsContainer.hits.map((h: any) => h.fields.solution[0])).size;
    const files = hitsContainer.total.value;
    let hits = 0;
    for (let hit of hitsContainer.hits) {
      const content: string = hit.highlight.content[0];
      let lastIndex = -uniqueId.length;
      let occurrences = 0;
      while ((lastIndex = content.indexOf(uniqueId, lastIndex + uniqueId.length)) >= 0) {
        occurrences++;
      }
      hits += occurrences / 2;
    }
    return {solutions, files, hits};
  }

  async find(assignment: string, params: SearchParams): Promise<SearchResult[]> {
    const {uniqueId, result} = await this._search(assignment, params);
    const grouped = new Map<string, SearchResult>();
    for (let hit of result.body.hits.hits) {
      const result = this._convertHit(hit, uniqueId, params.context);
      const existing = grouped.get(result.solution);
      if (existing) {
        existing.snippets.push(...result.snippets);
      } else {
        grouped.set(result.solution, result);
      }
    }
    return [...grouped.values()];
  }

  private async _search(assignment: string, {q: snippet, glob}: SearchParams, fields?: (keyof FileDocument)[]) {
    const uniqueId = randomUUID();
    const regex = glob && this.glob2RegExp(glob);
    const result = await this.elasticsearchService.search({
      index: 'files',
      body: {
        size: 10000,
        fields,
        _source: !fields,
        query: {
          bool: {
            must: {
              match_phrase: {
                content: {
                  query: snippet,
                },
              },
            },
            filter: [
              {term: {assignment}},
              ...(regex ? [{regexp: {'file.keyword': {value: regex, flags: '', case_insensitive: true}}}] : []),
            ],
          },
        },
        highlight: {
          fields: {
            content: {},
          },
          pre_tags: [uniqueId],
          post_tags: [uniqueId],
          number_of_fragments: 0,
          type: 'fvh',
        },
      },
    });
    return {uniqueId, result};
  }

  async deleteAll(assignment: string, solution?: string): Promise<number> {
    const result = await this.elasticsearchService.deleteByQuery({
      index: 'files',
      body: {
        query: {
          bool: {
            filter: [
              {term: {assignment}},
              ...(solution ? [{term: {solution}}] : []),
            ],
          },
        },
      },
    });
    return result.body.deleted;
  }

  private glob2RegExp(glob: string): string {
    return glob.replace(/\*\*\/?|[.?+*|{}()"\\]/g, match => {
      switch (match) {
        case '**/':
        case '**':
          return '.*';
        case '*':
          return '[^\\/]*';
        case '?':
          return '.';
        case '\\':
          return '/';
        default:
          return '\\' + match;
      }
    });
  }

  _convertHit(hit: { _source: FileDocument, highlight: { content: string[] } }, uniqueId: string, contextLines?: number): SearchResult {
    const {assignment, solution, file, content} = hit._source;
    const lineStartIndices = this._buildLineStartList(content);
    const highlightContent = hit.highlight.content[0];
    const split = highlightContent.split(uniqueId);

    let start = 0;
    const snippets: SearchSnippet[] = [];

    for (let i = 1; i < split.length; i += 2) {
      start += split[i - 1].length;

      const code = split[i];
      const end = start + code.length;
      const from = this._findLocation(lineStartIndices, start);
      const to = this._findLocation(lineStartIndices, end);
      const snippet: SearchSnippet = {
        file,
        from,
        to,
        code,
        comment: '',
      };

      if (contextLines !== undefined) {
        const contextStart = lineStartIndices[from.line < contextLines ? 0 : from.line - contextLines];
        const contextEnd = to.line + contextLines + 1 >= lineStartIndices.length ? code.length : lineStartIndices[to.line + contextLines + 1];
        snippet.context = content.substring(contextStart, contextEnd);
      }

      snippets.push(snippet);

      start = end;
    }

    return {assignment, solution, snippets};
  }

  _findLocation(lineStarts: number[], start: number): Location {
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
