import {Injectable, OnModuleDestroy} from "@nestjs/common";
import * as tiktoken from "tiktoken";
import {File} from "@app/moss/moss-api";
import OpenAI from "openai";
import {TEXT_EXTENSIONS} from "../search/search.constants";

const model = 'text-embedding-ada-002';

@Injectable()
export class OpenAIService implements OnModuleDestroy {
  enc = tiktoken.encoding_for_model(model);

  onModuleDestroy(): any {
    this.enc.free();
  }

  countTokens(text: string): number {
    return this.enc.encode(text).length;
  }

  isSupportedExtension(filename: string) {
    const extension = filename.substring(filename.lastIndexOf('.') + 1);
    return TEXT_EXTENSIONS.has(extension);
  }

  estimateCost(tokens: number): number {
    // https://platform.openai.com/docs/guides/embeddings/embedding-models
    return tokens * 0.0000004;
  }

  async getEmbedding(text: string, apiKey: string): Promise<{ tokens: number, embedding: number[] }> {
    const api = new OpenAI({apiKey});
    const result = await api.embeddings.create({
      model: model,
      input: text,
    });
    return {tokens: result.usage.total_tokens, embedding: result.data[0].embedding};
  }
}
