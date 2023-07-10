import {HttpException, Injectable, OnModuleInit} from '@nestjs/common';
import {ElasticsearchService} from "@nestjs/elasticsearch";
import {SearchService} from "../search/search.service";
import {Embeddable, EmbeddableSearch} from "./embedding.dto";
import {OpenAIService} from "../classroom/openai.service";

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
      embedding: {
        type: 'dense_vector',
        dims: 1536,
        index: true,
        similarity: 'cosine',
      },
    }, {});
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
    const {statusCode, body} = await this.elasticsearchService.get({
      index: 'embeddings',
      id,
    });
    if (!statusCode) {
      return undefined;
    }
    if (statusCode === 404) {
      return undefined;
    }
    if (statusCode === 200) {
      return body as Embeddable;
    }
    throw new HttpException(body, statusCode);
  }

  private async index(emb: Embeddable): Promise<Embeddable> {
    return (await this.elasticsearchService.index({
      index: 'embeddings',
      id: emb.id,
      body: emb,
    })).body as Embeddable;
  }

  async getNearest({embedding, ...keyword}: EmbeddableSearch): Promise<(Embeddable & { _score: number })[]> {
    return (await this.elasticsearchService.search({
      index: 'embeddings',
      body: embedding ? {
        knn: {
          field: 'embedding',
          query_vector: embedding,
          k: 10,
          num_candidates: 100,
          filter: {
            keyword,
          },
        },
      } : {
        query: {
          filter: {
            keyword,
          },
        },
      },
    })).body.hits;
  }
}
