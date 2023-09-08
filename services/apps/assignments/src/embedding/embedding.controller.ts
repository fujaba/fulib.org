import {Controller, Get, Param, ParseBoolPipe, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiTags, refs} from "@nestjs/swagger";
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

  @Post('embeddings')
  @ApiCreatedResponse({type: EmbeddingEstimate})
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to create embeddings.'})
  async createEmbeddings(
    @Param('assignment') assignmentId: string,
    @Query('estimate', ParseBoolPipe) estimate?: boolean,
  ): Promise<EmbeddingEstimate> {
    if (estimate) {
      return this.embeddingService.estimateEmbeddings(assignmentId);
    }

    const assignment = await this.assignmentService.findOne(assignmentId) || notFound(assignmentId);
    const apiKey = assignment.classroom?.openaiApiKey;
    if (apiKey) {
      return this.embeddingService.createEmbeddings(assignmentId, apiKey);
    }
    return {tokens: 0, estimatedCost: 0};
  }

  @Get('embeddings')
  @ApiOkResponse({type: EmbeddingEstimate})
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to estimate embeddings.'})
  async getEmbeddings(
    @Param('assignment') assignment: string,
    @Query('id') id: string,
  ): Promise<Embeddable[]> {
    const embeddable = await this.embeddingService.find(id) || notFound(id);
    return this.embeddingService.getNearest({
      assignment,
      type: 'snippet',
      embedding: embeddable.embedding,
    });
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
