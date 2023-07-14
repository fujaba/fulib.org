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
    const result = await this.elasticsearchService.get<Embeddable>({
      index: 'embeddings',
      id,
    });
    return result.found ? result._source : undefined;
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
    const response = await this.elasticsearchService.search<Embeddable>({
      index: 'embeddings',
      query: embedding ? {
        knn: {
          field: 'embedding',
          query_vector: embedding,
          k: 10,
          num_candidates: 100,
          filter: {
            keyword,
          },
        },
      } as any : {
        query: {
          filter: {
            keyword,
          },
        },
      },
    });
    return response.hits.hits.map(({_score, _source}) => ({...(_source as Embeddable), _score: _score || 0}));
  }
}
