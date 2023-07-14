import {Controller, Get, Param, Post, Query} from '@nestjs/common';
import {ApiExtraModels, ApiOkResponse, ApiTags, refs} from "@nestjs/swagger";
import {AssignmentAuth} from "../assignment/assignment-auth.decorator";
import {Embeddable, EmbeddingEstimate, SnippetEmbeddable, TaskEmbeddable} from "./embedding.dto";
import {EmbeddingService} from "./embedding.service";
import {notFound} from "@mean-stream/nestx";
import {AssignmentService} from "../assignment/assignment.service";

@Controller('assignments/:assignment')
@ApiTags('Embeddings')
export class EmbeddingController {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly assignmentService: AssignmentService,
  ) {
  }

  @Get('embeddings')
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to estimate embeddings.'})
  async estimateEmbeddings(
    @Param('assignment') assignment: string,
  ): Promise<EmbeddingEstimate> {
    return this.embeddingService.estimateEmbeddings(assignment);
  }

  @Post('embeddings')
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to create embeddings.'})
  async createEmbeddings(
    @Param('assignment') assignmentId: string,
  ): Promise<void> {
    const assignment = await this.assignmentService.findOne(assignmentId) || notFound(assignmentId);
    const apiKey = assignment.classroom?.openaiApiKey;
    apiKey && await this.embeddingService.createEmbeddings(assignmentId, apiKey);
  }

  @Get('solutions/:solution/embeddings')
  @ApiExtraModels(TaskEmbeddable, SnippetEmbeddable)
  @ApiOkResponse({schema: {oneOf: refs(TaskEmbeddable, SnippetEmbeddable)}})
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to view this solution.'})
  async getSolutionEmbeddings(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('task') task?: string,
  ): Promise<Embeddable[]> {
    const taskEmbedding = task ? await this.embeddingService.find(task) || notFound(task) : undefined;
    return this.embeddingService.getNearest({
      assignment,
      solution,
      embedding: taskEmbedding?.embedding,
    });
  }
}
