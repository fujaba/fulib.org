import {Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import * as tiktoken from "tiktoken";
import {File} from "@app/moss/moss-api";
import {MOSS_LANGUAGES} from "../assignment/assignment.schema";
import {SearchService} from "../search/search.service";

@Injectable()
export class OpenAIService implements OnModuleInit, OnModuleDestroy {
  enc = tiktoken.encoding_for_model('text-embedding-ada-002');

  allowedExtensions = Object.values(MOSS_LANGUAGES).flat();

  constructor(
    private searchService: SearchService,
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
}
