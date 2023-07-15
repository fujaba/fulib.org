import {Injectable, OnModuleDestroy} from "@nestjs/common";
import * as tiktoken from "tiktoken";
import {File} from "@app/moss/moss-api";
import {Configuration, OpenAIApi} from "openai";
import {MOSS_LANGUAGES} from "../search/search.constants";

const model = 'text-embedding-ada-002';

@Injectable()
export class OpenAIService implements OnModuleDestroy {
  enc = tiktoken.encoding_for_model(model);

  allowedExtensions = Object.values(MOSS_LANGUAGES).flat();

  onModuleDestroy(): any {
    this.enc.free();
  }

  countTokens(files: File[]): number {
    let total = 0;
    for (let file of files) {
      if (!this.isSupportedExtension(file.name)) {
        continue;
      }

      const tokens = this.enc.encode(file.content.toString()).length;
      total += tokens;
    }
    return total;
  }

  isSupportedExtension(filename: string) {
    return this.allowedExtensions.some(ext => filename.endsWith(ext));
  }

  estimateCost(tokens: number): number {
    // https://platform.openai.com/docs/guides/embeddings/embedding-models
    return tokens * 0.0000004;
  }

  async getEmbedding(text: string, apiKey: string): Promise<{ tokens: number, embedding: number[] }> {
    const api = new OpenAIApi(new Configuration({apiKey}));
    const result = await api.createEmbedding({
      model: model,
      input: text,
    });
    return {tokens: result.data.usage.total_tokens, embedding: result.data.data[0].embedding};
  }
}