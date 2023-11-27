import {ForbiddenException, Injectable, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from "@nestjs/elasticsearch";
import {FileDocument, SearchService} from "../search/search.service";
import {Embeddable, EmbeddableSearch, EmbeddingEstimate, SnippetEmbeddable} from "./embedding.dto";
import {OpenAIService} from "./openai.service";
import {QueryDslQueryContainer} from "@elastic/elasticsearch/lib/api/types";
import {SolutionService} from "../solution/solution.service";
import {Assignment} from "../assignment/assignment.schema";
import {FilterQuery} from "mongoose";
import {Solution} from "../solution/solution.schema";
import * as ignore from 'ignore-file';

type DeclarationSnippet = SnippetEmbeddable & { name: string };

@Injectable()
export class EmbeddingService implements OnModuleInit {
  constructor(
    private searchService: SearchService,
    private elasticsearchService: ElasticsearchService,
    private openaiService: OpenAIService,
    private solutionService: SolutionService,
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
        // dot_product is faster than cosine, because OpenAI embeddings are already normalized
        similarity: 'dot_product',
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
      name: {
        type: 'text',
        fields: {keyword: {type: 'keyword', ignore_above: 256}},
      },
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

  async createEmbeddings(assignment: Assignment, estimate = false): Promise<EmbeddingEstimate> {
    const apiKey = assignment.classroom?.openaiApiKey;
    if (!apiKey) {
      throw new ForbiddenException('No OpenAI API key configured for this assignment.');
    }

    const {solutions, documents, ignoreFn, ignoredFiles} = await this.getDocuments(assignment);
    const ignoredFunctions = new Set<string>();
    let functions = documents
      .flatMap(d => d.file.endsWith('.py')
        ? this.getFunctions(d, PYTHON_FUNCTION_HEADER, findIndentEnd)
        : this.getFunctions(d, CLIKE_FUNCTION_HEADER, findClosingBrace)
      )
    ;
    if (ignoreFn) {
      functions = functions.filter(f => {
        if (ignoreFn(f.file)) {
          ignoredFunctions.add(f.id);
          return false;
        }
        return true;
      });
    }

    let tokens = 0;
    if (estimate) {
      for (const func of functions) {
        tokens += this.openaiService.countTokens(func.text);
      }
    } else {
      tokens = (await Promise.all(functions.map(async func => this.upsert(func, apiKey).then(({tokens}) => tokens))))
        .reduce((a, b) => a + b, 0);
    }

    return {
      solutions,
      files: documents.length,
      tokens,
      estimatedCost: this.openaiService.estimateCost(tokens),
      functions: functions.map(f => `${f.file}#${f.name}`),
      ignoredFiles: Array.from(ignoredFiles),
      ignoredFunctions: Array.from(ignoredFunctions),
    };
  }

  private async getDocuments(assignment: Assignment) {
    const filter: FilterQuery<Solution> = {assignment: assignment._id};
    if (assignment.classroom?.openaiConsent !== false) {
      filter['consent.3P'] = true;
    }
    const solutionsWithConsent = await this.solutionService.findAll(filter, {projection: {_id: 1}});
    const allDocuments = await this.searchService.findAll(assignment._id.toString(), solutionsWithConsent.map(s => s.id));

    const ignoreFn = assignment.classroom?.openaiIgnore ? ignore.compile(assignment.classroom.openaiIgnore) as (path: string) => boolean : undefined;
    const ignoredFiles = new Set<string>();
    const documents = allDocuments.filter(d => {
      if (!this.openaiService.isSupportedExtension(d.file)) {
        ignoredFiles.add(d.file);
        return false;
      }
      if (ignoreFn && ignoreFn(d.file)) {
        ignoredFiles.add(d.file);
        return false;
      }
      return true;
    });

    return {
      solutions: solutionsWithConsent.length,
      documents,
      ignoreFn,
      ignoredFiles,
    };
  }

  getFunctions(document: FileDocument, headPattern: RegExp, findEnd: (code: string, headStart: number, headEnd: number) => number): DeclarationSnippet[] {
    const {content, file, solution, assignment} = document;
    const results: DeclarationSnippet[] = [];
    const lineStarts = this.searchService._buildLineStartList(content);
    for (const match of content.matchAll(headPattern)) {
      const name = match[1];
      const start = match.index!;
      const {line, character: column} = this.searchService._findLocation(lineStarts, start);
      const end = findEnd(content, start, start + match[0].length);
      const text = content.substring(start - column, end + 1);
      results.push({
        id: `${solution}-${file}-${line}`,
        type: 'snippet',
        assignment,
        solution,
        file,
        line,
        name,
        text,
        embedding: [],
      });
    }
    return results;
  }

  async upsert(embeddable: Embeddable, apiKey: string): Promise<{ embeddable: Embeddable, tokens: number }> {
    const existing = await this.find(embeddable.id);
    if (existing && existing.text === embeddable.text) {
      return {embeddable: existing, tokens: 0};
    }
    const {embedding, tokens} = await this.openaiService.getEmbedding(embeddable.text, apiKey);
    embeddable.embedding = embedding;
    await this.index(embeddable);
    return {embeddable, tokens};
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
        filter: Object.entries(keyword)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => ({term: {[key]: value}})),
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

  async deleteTasksNotIn(assignment: string, tasks: string[]): Promise<number> {
    const body = await this.elasticsearchService.deleteByQuery({
      index: 'embeddings',
      query: {
        bool: {
          must: {
            term: {
              assignment,
              type: 'task',
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

  async deleteAll(assignment: string): Promise<number> {
    const body = await this.elasticsearchService.deleteByQuery({
      index: 'embeddings',
      query: {
        bool: {
          must: {
            term: {
              assignment,
            },
          },
        },
      },
    });
    return body.deleted || 0;
  }

  async deleteBySolution(assignment: string, solution: string): Promise<number> {
    const body = await this.elasticsearchService.deleteByQuery({
      index: 'embeddings',
      query: {
        bool: {
          must: {
            term: {
              assignment,
              solution,
            },
          },
        },
      },
    });
    return body.deleted || 0;
  }
}

export const PYTHON_FUNCTION_HEADER = /(?:async\s*)?def ([a-zA-Z0-9_]+)\([^)]*\)\s*:/gi;
export const CLIKE_FUNCTION_HEADER = /([a-zA-Z0-9_]+)\([^)]*\)\s*\{/gi;

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
    const nextLineIndex = code.indexOf('\n', currentIndex);
    if (nextLineIndex === -1) {
      return code.length - 1;
    }
    if (currentIndex === nextLineIndex) { // line is empty
      currentIndex++;
      continue;
    }
    const currentLine = code.substring(currentIndex, nextLineIndex);
    if (currentLine.startsWith(bodyIndent)) {
      currentIndex = nextLineIndex;
    } else {
      return currentIndex - 1;
    }
  }
}
