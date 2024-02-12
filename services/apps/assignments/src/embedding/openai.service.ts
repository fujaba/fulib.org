import {Injectable, OnModuleDestroy} from "@nestjs/common";
import * as tiktoken from "tiktoken";
import OpenAI from "openai";
import {TEXT_EXTENSIONS} from "../search/search.constants";

// https://platform.openai.com/docs/guides/embeddings/embedding-models
// https://openai.com/pricing#embedding-models
export const EMBEDDING_MODELS = {
  'text-embedding-ada-002': {
    tokenCost: 0.00010 / 1000,
    dimensions: undefined,
  },
  'text-embedding-3-small': {
    tokenCost: 0.00002 / 1000,
    dimensions: undefined,
  },
  'text-embedding-3-large': {
    tokenCost: 0.00013 / 1000,
    dimensions: 1536,
  },
} as const;
export type EmbeddingModel = keyof typeof EMBEDDING_MODELS;
export const DEFAULT_MODEL: EmbeddingModel = 'text-embedding-ada-002';

@Injectable()
export class OpenAIService implements OnModuleDestroy {
  readonly rateLimitPerMinute = 3000;

  private encoders: Record<EmbeddingModel, tiktoken.Tiktoken> = {
    // https://platform.openai.com/docs/guides/embeddings/how-can-i-tell-how-many-tokens-a-string-has-before-i-embed-it
    'text-embedding-ada-002': tiktoken.encoding_for_model('text-embedding-ada-002'),
    'text-embedding-3-small': tiktoken.get_encoding('cl100k_base'),
    'text-embedding-3-large': tiktoken.get_encoding('cl100k_base'),
  };

  onModuleDestroy(): any {
    for (const enc of Object.values(this.encoders)) {
      enc.free();
    }
  }

  countTokens(text: string, model: EmbeddingModel): number {
    return this.encoders[model].encode(text).length;
  }

  isSupportedExtension(filename: string) {
    const extension = filename.substring(filename.lastIndexOf('.') + 1);
    return TEXT_EXTENSIONS.has(extension);
  }

  estimateCost(tokens: number, model: EmbeddingModel): number {
    return tokens * EMBEDDING_MODELS[model].tokenCost;
  }

  async getEmbedding(text: string, apiKey: string, model: EmbeddingModel): Promise<{ tokens: number, embedding: number[] }> {
    const api = new OpenAI({apiKey});
    const result = await api.embeddings.create({
      model,
      input: text,
      dimensions: EMBEDDING_MODELS[model].dimensions,
    });
    return {tokens: result.usage.total_tokens, embedding: result.data[0].embedding};
  }
}
