import {Controller, Get, Param, ParseBoolPipe, Post, Query} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {AssignmentAuth} from "../assignment/assignment-auth.decorator";
import {Embeddable, EmbeddingEstimate} from "./embedding.dto";
import {EmbeddingService} from "./embedding.service";
import {notFound, ObjectIdPipe} from "@mean-stream/nestx";
import {AssignmentService} from "../assignment/assignment.service";
import {Types} from "mongoose";

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
    @Param('assignment', ObjectIdPipe) assignmentId: Types.ObjectId,
    @Query('estimate', new ParseBoolPipe({optional: true})) estimate?: boolean,
  ): Promise<EmbeddingEstimate> {
    const assignment = await this.assignmentService.find(assignmentId) || notFound(assignmentId);
    return this.embeddingService.createEmbeddings(assignment, estimate);
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
