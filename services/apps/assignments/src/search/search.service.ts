import {estypes} from '@elastic/elasticsearch';
import {BadRequestException, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {randomUUID} from 'crypto';
import {isDeepStrictEqual} from 'util';
import {Location} from '../evaluation/evaluation.schema';
import {SearchParams, SearchResult, SearchSnippet, SearchSummary} from './search.dto';
import {TOKEN_PATTERN} from "./search.constants";

export interface FileDocument {
  assignment: string;
  solution: string;
  file: string;
  content: string;
}

interface QueryPlan {
  query: estypes.QueryDslQueryContainer;
  tokens: number;
  highlighter: 'fvh' | 'unified';
}

@Injectable()
export class SearchService implements OnModuleInit {
  private logger = new Logger(SearchService.name);

  constructor(
    private elasticsearchService: ElasticsearchService,
  ) {
  }

  async onModuleInit() {
    try {
      await this.ensureIndex('files', {
        assignment: {
          type: 'text',
          fields: {keyword: {type: 'keyword', ignore_above: 256}}
        },
        content: {
          type: 'text',
          analyzer: 'code',
          term_vector: 'with_positions_offsets',
        },
        file: {
          type: 'text',
          fields: {keyword: {type: 'keyword', ignore_above: 256}}
        },
        solution: {
          type: 'text',
          fields: {keyword: {type: 'keyword', ignore_above: 256}}
        }
      }, {
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
      });
    } catch (e) {
      this.logger.error('Failed to initialize Elasticsearch:', e);
    }
  }

  async ensureIndex(name: string, properties: any, analysis: any) {
    const existingIndex = await this.elasticsearchService.indices.get({
      index: name,
    }).catch(() => null);

    const newName = `${name}-${Date.now()}`;

    if (existingIndex) {
      const {0: oldName, 1: oldData} = Object.entries(existingIndex)[0];

      const actualProperties = oldData.mappings?.properties;
      const actualAnalysis = oldData.settings?.index?.analysis;
      if (isDeepStrictEqual(properties, actualProperties) && isDeepStrictEqual(actualAnalysis, analysis)) {
        return;
      }

      this.logger.log(`Migrating ${name} index: ${oldName} -> ${newName}`);

      await this.createIndex(newName, properties, analysis);

      // transfer data from old index to new index
      await this.elasticsearchService.reindex({
        source: {
          index: oldName,
        },
        dest: {
          index: newName,
        },
      }, {
        requestTimeout: '600s',
      });

      // add alias from name to newName
      await this.elasticsearchService.indices.updateAliases({
        actions: [
          {remove_index: {index: oldName}},
          {add: {index: newName, alias: name}},
        ],
      });

      // delete old index
      await this.elasticsearchService.indices.delete({
        index: oldName,
      }).catch(() => null);
    } else {
      this.logger.log(`Creating ${name} index: ${newName}`);
      await this.createIndex(newName, properties, analysis);

      // add alias name -> newName
      await this.elasticsearchService.indices.putAlias({
        name,
        index: newName,
      });
    }
  }

  private async createIndex(newName: string, properties: any, analysis: any) {
    await this.elasticsearchService.indices.create({
      index: newName,
      body: {
        mappings: {
          properties,
        },
        settings: {
          analysis,
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
    const {uniqueId, result, tokens} = await this._search(assignment, params, ['solution']);
    const pattern = this.createPattern(uniqueId);
    const hitsContainer = result.hits;
    const solutions = new Set(hitsContainer.hits.map((h: any) => h.fields.solution[0])).size;
    const files = typeof hitsContainer.total === 'number' ? hitsContainer.total : hitsContainer.total?.value || 0;
    let hits = 0;
    for (const hit of hitsContainer.hits) {
      let occurrences = 0;
      const content = hit.highlight?.content[0];
      if (content) {
        for (const {} of content.matchAll(pattern)) {
          occurrences++;
        }
      }
      hits += occurrences / tokens;
    }
    return {solutions, files, hits};
  }

  async find(assignment: string, params: SearchParams): Promise<SearchResult[]> {
    const {uniqueId, result, tokens} = await this._search(assignment, params);
    const grouped = new Map<string, SearchResult>();
    for (const hit of result.hits.hits) {
      const result = this._convertHit(hit, uniqueId, params.context, tokens);
      const existing = grouped.get(result.solution);
      if (existing) {
        existing.snippets.push(...result.snippets);
      } else {
        grouped.set(result.solution, result);
      }
    }
    return [...grouped.values()];
  }

  private async _search(assignment: string, {
    q: snippet,
    glob,
    wildcard,
  }: SearchParams, fields?: (keyof FileDocument)[]) {
    const uniqueId = randomUUID();
    const regex = glob && this.glob2RegExp(glob);
    const {tokens, highlighter, query} = this._createQuery(snippet, wildcard);
    const result = await this.elasticsearchService.search<FileDocument>({
      index: 'files',
      body: {
        size: 10000,
        fields,
        _source: !fields,
        query: {
          bool: {
            must: query,
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
          pre_tags: [`<${uniqueId}>`],
          post_tags: [`</${uniqueId}>`],
          type: highlighter,
          number_of_fragments: 0,
        },
      },
    });
    return {uniqueId, result, tokens};
  }

  async findAll(assignment: string): Promise<FileDocument[]> {
    const result = await this.elasticsearchService.search<FileDocument>({
      index: 'files',
      size: 10000,
      _source: true,
      query: {
        bool: {
          filter: {
            term: {assignment},
          },
        },
      },
    });
    return result.hits.hits.map(h => h._source!);
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
    return result.deleted || 0;
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

  _convertHit(hit: estypes.SearchHit<FileDocument>, uniqueId: string, contextLines?: number, tokens = 1): SearchResult {
    const {assignment, solution, file, content} = hit._source!;
    const lineStartIndices = this._buildLineStartList(content);
    if (!hit.highlight) {
      return {assignment, solution, snippets: []};
    }

    const tokenSnippets: SearchSnippet[] = [];
    let i = -1;
    for (const match of hit.highlight.content[0].matchAll(this.createPattern(uniqueId))) {
      i++;
      const {1: code, index} = match;
      const start = index! - i * (uniqueId.length * 2 + 5);
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

      tokenSnippets.push(snippet);
    }

    const snippets: SearchSnippet[] = [];
    for (let i = 0; i < tokenSnippets.length; i += tokens) {
      const from = tokenSnippets[i].from;
      const to = tokenSnippets[i + tokens - 1].to;
      const code = content.substring(lineStartIndices[from.line] + from.character, lineStartIndices[to.line] + to.character);
      snippets.push({
        file,
        from,
        to,
        code,
        comment: '',
      });
    }

    if (contextLines !== undefined) {
      for (const snippet of snippets) {
        const contextStart = lineStartIndices[snippet.from.line < contextLines ? 0 : snippet.from.line - contextLines];
        const contextEnd = snippet.to.line + contextLines + 1 >= lineStartIndices.length ? content.length : lineStartIndices[snippet.to.line + contextLines + 1];
        snippet.context = content.substring(contextStart, contextEnd);
      }
    }

    return {assignment, solution, snippets};
  }

  private createPattern(uniqueId: string) {
    return new RegExp(`<${uniqueId}>(.*?)</${uniqueId}>`, 'gs');
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

  _createQuery(snippet: string, wildcard?: string): QueryPlan {
    if (!wildcard) {
      return this.createPhraseQuery(snippet);
    }

    const split = snippet.split(wildcard);
    if (split.length === 1) {
      return this.createPhraseQuery(snippet);
    }

    let tokenCount = 0;
    const clauses: estypes.QueryDslSpanQuery[] = split.map(part => {
      const tokens = [...part.matchAll(TOKEN_PATTERN)];
      tokenCount += tokens.length;
      if (tokens.length === 1) {
        return {
          span_term: {
            content: tokens[0][0],
          },
        };
      }

      const span_near: estypes.QueryDslSpanNearQuery = {
        in_order: true,
        slop: 0,
        clauses: tokens.map(([token]) => ({
          span_term: {
            content: token,
          },
        })),
      };
      return {span_near};
    }).filter(a => 'span_term' in a || a.span_near?.clauses?.length);
    if (!clauses.length) {
      throw new BadRequestException('Query must not contain only wildcard');
    }
    return {
      tokens: tokenCount,
      highlighter: 'unified',
      // https://www.paulbutcher.space/blog/2021/01/23/wildcards-in-elasticsearch-phrases#:~:text=%E2%80%9Cthe%20casbah%20*%20a%20hurricane%E2%80%9D%20becomes%3A
      query: {
        span_near: {
          slop: 100,
          in_order: true,
          clauses,
        },
      },
    };
  }

  private createPhraseQuery(snippet: string): QueryPlan {
    return {
      tokens: 1, // fvh highlights the entire phrase thankfully, so this is simple
      highlighter: 'fvh',
      query: {
        match_phrase: {
          content: {
            query: snippet,
          },
        },
      },
    };
  }
}
