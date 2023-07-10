import {Injectable, OnModuleInit} from '@nestjs/common';
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
    const existing = await this.elasticsearchService.get({
      index: 'embeddings',
      id: emb.id,
    });
    if (existing && existing.body.text === emb.text) {
      return existing.body as Embeddable;
    }
    emb.embedding = await this.openaiService.getEmbedding(emb.text, apiKey);
    return this.index(emb);
  }


  private async index(emb: Embeddable): Promise<Embeddable> {
    return (await this.elasticsearchService.index({
      index: 'embeddings',
      id: emb.id,
      body: emb,
    })).body as Embeddable;
  }

  async getNearest({assignment, embedding, type}: EmbeddableSearch): Promise<(Embeddable & { _score: number })[]> {
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
