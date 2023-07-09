import {Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import * as tiktoken from "tiktoken";
import {File} from "@app/moss/moss-api";
import {MOSS_LANGUAGES} from "../assignment/assignment.schema";
import {SearchService} from "../search/search.service";
import {ElasticsearchService} from "@nestjs/elasticsearch";
import {Configuration, OpenAIApi} from "openai";

interface BaseEmbeddable {
  id: string;
  assignment: string;
  text: string;
  embedding: number[];
}

interface TaskEmbeddable extends BaseEmbeddable {
  type: 'task';
  task: string;
}

interface SnippetEmbeddable extends BaseEmbeddable {
  type: 'snippet';
  solution: string;
  file: string;
  line: number;
  column: number;
}

type Embeddable = TaskEmbeddable | SnippetEmbeddable;

type EmbeddableSearch = Pick<Embeddable, 'assignment' | 'embedding'> & Partial<Pick<Embeddable, 'type'>>;

@Injectable()
export class OpenAIService implements OnModuleInit, OnModuleDestroy {
  enc = tiktoken.encoding_for_model('text-embedding-ada-002');

  allowedExtensions = Object.values(MOSS_LANGUAGES).flat();

  constructor(
    private searchService: SearchService,
    private elasticsearchService: ElasticsearchService,
  ) {
  }

  async onModuleInit(): Promise<any> {
    await this.searchService.ensureIndex('embeddings', {
      embedding: {
        type: 'dense_vector',
        dims: 1536,
        index: true,
        similarity: "cosine",
      },
    }, {});
  }

  onModuleDestroy(): any {
    this.enc.free();
  }

  countTokens(files: File[]): number {
    let total = 0;
    for (let file of files) {
      if (!this.allowedExtensions.some(ext => file.name.endsWith(ext))) {
        continue;
      }

      const tokens = this.enc.encode(file.content.toString()).length;
      total += tokens;
    }
    return total;
  }

  estimateCost(tokens: number): number {
    // https://platform.openai.com/docs/guides/embeddings/embedding-models
    return tokens * 0.0000004;
  }

  async upsert(emb: Embeddable, apiKey: string): Promise<Embeddable> {
    const existing = await this.elasticsearchService.get({
      index: 'embeddings',
      id: emb.id,
    });
    if (existing && existing.body.text === emb.text) {
      return existing.body as Embeddable;
    }
    emb.embedding = await this.getEmbedding(emb.text, apiKey);
    return this.index(emb);
  }

  private async getEmbedding(text: string, apiKey: string): Promise<number[]> {
    const api = new OpenAIApi(new Configuration({apiKey}));
    const result = await api.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return result.data.data[0].embedding;
  }

  private async index(emb: Embeddable): Promise<Embeddable> {
    return (await this.elasticsearchService.index({
      index: 'embeddings',
      id: emb.id,
      body: emb,
    })).body as Embeddable;
  }

  async getNearest({assignment, embedding, type}: EmbeddableSearch): Promise<(Embeddable & {_score: number})[]> {
    return (await this.elasticsearchService.search({
      index: 'embeddings',
      body: {
        knn: {
          field: 'embedding',
          query_vector: embedding,
          k: 10,
          num_candidates: 100,
          filter: {
            term: {
              assignment,
              type,
            },
          },
        },
      },
    })).body.hits;
  }
}
