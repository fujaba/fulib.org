import {Injectable, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from "@nestjs/elasticsearch";
import {SearchService} from "../search/search.service";
import {Embeddable, EmbeddableSearch, EmbeddingEstimate, SnippetEmbeddable} from "./embedding.dto";
import {OpenAIService} from "../classroom/openai.service";
import {QueryDslQueryContainer} from "@elastic/elasticsearch/lib/api/types";

type DeclarationSnippet = Pick<SnippetEmbeddable, 'text' | 'line'> & { name: string };

@Injectable()
export class EmbeddingService implements OnModuleInit {
  constructor(
    private searchService: SearchService,
    private elasticsearchService: ElasticsearchService,
    private openaiService: OpenAIService,
  ) {
  }

  async onModuleInit(): Promise<any> {
    await this.searchService.ensureIndex('embeddings', {
      assignment: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      },
      embedding: {
        type: 'dense_vector',
        dims: 1536,
        index: true,
        similarity: 'cosine'
      },
      file: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      },
      id: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      },
      line: {type: 'long'},
      solution: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      },
      task: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      },
      text: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      },
      type: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}}
      }
    }, undefined);
  }

  async estimateEmbeddings(assignment: string): Promise<EmbeddingEstimate> {
    const documents = await this.searchService.findAll(assignment);
    const tokens = this.openaiService.countTokens(documents.map(d => ({
      name: d.file,
      content: d.content,
      size: d.content.length
    })));
    const estimatedCost = this.openaiService.estimateCost(tokens);
    return {
      tokens,
      estimatedCost,
    };
  }

  getFunctions(file: string, headPattern: RegExp, findEnd: (code: string, headStart: number, headEnd: number) => number): DeclarationSnippet[] {
    const results: DeclarationSnippet[] = [];
    const lineStarts = this.searchService._buildLineStartList(file);
    for (const match of file.matchAll(headPattern)) {
      const name = match[1];
      const start = match.index!;
      const {line, character: column} = this.searchService._findLocation(lineStarts, start);
      const end = findEnd(file, start, start + match[0].length);
      const text = file.substring(start - column, end + 1);
      results.push({line, name, text});
    }
    return results;
  }

  async createEmbeddings(assignment: string, apiKey: string) {
    const documents = await this.searchService.findAll(assignment);
    await Promise.all(documents
      .filter(d => this.openaiService.isSupportedExtension(d.file))
      .map(async d => {
        const functions = d.file.endsWith('.py')
          ? this.getFunctions(d.content, /(async\s*)?def ([a-zA-Z0-9_]+)\([^)]*\)\s*:/gi, findIndentEnd)
          : this.getFunctions(d.content, /([a-zA-Z0-9_]+)\([^)]*\)\s*\{/gi, findClosingBrace)
        ;
        return Promise.all(functions.map(async ({line, name, text}) => {
          return this.upsert({
            id: `${d.solution}-${d.file}-${line}-${name}`,
            assignment,
            type: 'snippet',
            solution: d.solution,
            file: d.file,
            line,
            text: `${d.file}\n\n${text}`,
            embedding: [],
          }, apiKey);
        }));
      }));
  }

  async upsert(emb: Embeddable, apiKey: string): Promise<Embeddable> {
    const existing = await this.find(emb.id);
    if (existing && existing.text === emb.text) {
      return existing;
    }
    emb.embedding = await this.openaiService.getEmbedding(emb.text, apiKey);
    return this.index(emb);
  }

  async find(id: string): Promise<Embeddable | undefined> {
    const result = await this.elasticsearchService.get<Embeddable>({
      index: 'embeddings',
      id,
    }).catch(() => undefined);
    return result?.found ? result._source : undefined;
  }

  private async index(emb: Embeddable): Promise<Embeddable> {
    await this.elasticsearchService.index({
      index: 'embeddings',
      id: emb.id,
      document: emb,
    });
    return emb;
  }

  async getNearest({embedding, ...keyword}: EmbeddableSearch): Promise<(Embeddable & { _score: number })[]> {
    const filter: QueryDslQueryContainer = {
      bool: {
        filter: Object.entries(keyword).map(([key, value]) => ({
          term: {
            [key]: value,
          },
        })),
      },
    };
    const response = await this.elasticsearchService.search<Embeddable>(embedding ? {
      index: 'embeddings',
      knn: {
        field: 'embedding',
        query_vector: embedding,
        k: 10,
        num_candidates: 100,
        filter,
      },
      _source_excludes: ['embedding'],
    } : {
      index: 'embeddings',
      query: filter,
      _source_excludes: ['embedding'],
    });
    return response.hits.hits.map(({_score, _source}) => ({...(_source as Embeddable), _score: _score || 0}));
  }

  async deleteNotIn(assignment: string, tasks: string[]): Promise<number> {
    const body = await this.elasticsearchService.deleteByQuery({
      index: 'embeddings',
      query: {
        bool: {
          must: {
            term: {
              assignment,
            },
          },
          must_not: {
            terms: {
              task: tasks,
            },
          },
        },
      },
    });
    return body.deleted || 0;
  }
}

export function findClosingBrace(code: string, headStart: number, headEnd: number): number {
  let depth = 1;
  for (let i = headEnd; i < code.length; i++) {
    if (code[i] === '{') {
      depth++;
    } else if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

export function findIndentEnd(code: string, headStart: number, headEnd: number): number {
  const firstLineStart = code.indexOf('\n', headEnd) + 1;
  let bodyIndentEnd = firstLineStart;
  while (bodyIndentEnd < code.length && code[bodyIndentEnd] === ' ' || code[bodyIndentEnd] === '\t') {
    bodyIndentEnd++;
  }

  const bodyIndent = code.substring(firstLineStart, bodyIndentEnd);
  let currentIndex = firstLineStart;
  while (true) {
    const nextLineIndex = (code.indexOf('\n', currentIndex) + 1) || code.length
    const currentLine = code.substring(currentIndex, nextLineIndex);
    if (currentLine.startsWith(bodyIndent)) {
      currentIndex = nextLineIndex;
    } else {
      return currentIndex;
    }
  }
}
