import {Injectable, OnModuleDestroy} from "@nestjs/common";
import * as tiktoken from "tiktoken";
import {File} from "@app/moss/moss-api";
import {MOSS_LANGUAGES} from "../assignment/assignment.schema";

@Injectable()
export class OpenAIService implements OnModuleDestroy {
  enc = tiktoken.encoding_for_model('text-embedding-ada-002');

  allowedExtensions = Object.values(MOSS_LANGUAGES).flat();

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
