import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(
    private elasticsearchService: ElasticsearchService,
  ) {
  }

  async addFile(assignment: string, solution: string, file: string, content: string) {
    await this.elasticsearchService.index({
      index: 'files',
      id: `${assignment}/${solution}/${file}`,
      body: {
        assignment,
        solution,
        file,
        content,
      },
    });
  }
}
