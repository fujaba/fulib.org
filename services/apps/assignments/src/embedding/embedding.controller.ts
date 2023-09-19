import {Controller, ForbiddenException, Get, Param, ParseBoolPipe, Post, Query} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation, ApiParam,
  ApiTags,
  refs
} from "@nestjs/swagger";
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
  @ApiOperation({summary: 'Create embeddings for all tasks and solutions in an assignment'})
  @ApiCreatedResponse({type: EmbeddingEstimate})
  @ApiForbiddenResponse({description: 'No OpenAI API key configured for this assignment.'})
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
    if (!apiKey) {
      throw new ForbiddenException('No OpenAI API key configured for this assignment.');
    }
    return this.embeddingService.createEmbeddings(assignmentId, apiKey);
  }

  @Get('embeddings')
  @ApiOkResponse({type: EmbeddingEstimate})
  @ApiOperation({summary: 'Get embeddables related to an embeddable or task'})
  @AssignmentAuth({forbiddenResponse: 'You are not allowed to read embeddings.'})
  @ApiParam({name: 'id', description: 'Embeddable ID to find related embeddables'})
  @ApiParam({name: 'task', description: 'Task ID to find related embeddables'})
  @ApiParam({name: 'solution', description: 'Solution ID to limit search to a specific solution'})
  @ApiParam({name: 'type', description: 'Type of embeddable to limit search', enum: ['snippet', 'task']})
  async getEmbeddings(
    @Param('assignment') assignment: string,
    @Query('id') id?: string,
    @Query('task') task?: string,
    @Query('solution') solution?: string,
    @Query('type') type?: 'snippet' | 'task',
  ): Promise<Embeddable[]> {
    id ||= task;
    const embeddable = id ? await this.embeddingService.find(id) || notFound(id) : undefined;
    return this.embeddingService.getNearest({
      assignment,
      solution,
      type,
      embedding: embeddable?.embedding,
    });
  }
}
