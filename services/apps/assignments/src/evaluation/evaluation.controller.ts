import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Headers, MessageEvent, Param, Patch, Post, Query, Sse} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {FilterQuery, Types} from 'mongoose';
import {Observable} from 'rxjs';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {SolutionAuth} from '../solution/solution-auth.decorator';
import {eventStream} from '../utils';
import {CreateEvaluationDto, FilterEvaluationParams, RemarkDto, UpdateEvaluationDto} from './evaluation.dto';
import {Evaluation} from './evaluation.schema';
import {EvaluationService} from './evaluation.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment')
@ApiTags('Evaluations')
export class EvaluationController {
  constructor(
    private readonly evaluationService: EvaluationService,
  ) {
  }

  private toQuery(assignment: Types.ObjectId, solution?: Types.ObjectId, params: FilterEvaluationParams = {}): FilterQuery<Evaluation> {
    const query: FilterQuery<Evaluation> = {assignment};
    solution && (query.solution = solution);
    params.file && (query['snippets.file'] = params.file);
    params.task && (query.task = params.task);
    params.origin && (query['codeSearch.origin'] = new Types.ObjectId(params.origin));
    if (params.codeSearch !== undefined) {
      query.author = params.codeSearch ? 'Code Search' : {$ne: 'Code Search'};
    }
    return query;
  }

  @Get('evaluations')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [Evaluation]})
  async findByAssignment(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Query() params?: FilterEvaluationParams,
  ): Promise<Evaluation[]> {
    return this.evaluationService.findAll(this.toQuery(assignment, undefined, params));
  }

  @Get('evaluations/unique/:field')
  @ApiOperation({summary: 'Find unique values for a field in evaluations.'})
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({isArray: true})
  async findUnique(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('field') field: string,
    @Query() params?: FilterEvaluationParams,
  ): Promise<unknown[]> {
    return this.evaluationService.findUnique(field, this.toQuery(assignment, undefined, params));
  }

  @Get('evaluations/remarks')
  @ApiOperation({summary: 'Find unique remarks and points.'})
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [RemarkDto]})
  async findRemarks(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Query() params?: FilterEvaluationParams,
  ): Promise<RemarkDto[]> {
    return this.evaluationService.findRemarks(this.toQuery(assignment, undefined, params));
  }

  @Post('solutions/:solution/evaluations')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiCreatedResponse({type: Evaluation})
  async create(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
    @Body() dto: CreateEvaluationDto,
    @AuthUser() user?: UserToken,
  ): Promise<Evaluation> {
    return this.evaluationService.createWithCodeSearch(assignment, solution, dto, user?.sub);
  }

  @Get('solutions/:solution/evaluations')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: [Evaluation]})
  async findAll(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
    @Query() params?: FilterEvaluationParams,
  ): Promise<Evaluation[]> {
    return this.evaluationService.findAll(this.toQuery(assignment, solution, params));
  }

  @Sse('solutions/:solution/evaluations/events')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Evaluation})
  stream(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
    @AuthUser() user?: UserToken,
    @Headers('assignment-token') assignmentToken?: string,
    @Headers('solution-token') solutionToken?: string,
  ): Observable<MessageEvent> {
    return eventStream(this.evaluationService.subscribe(assignment, solution, '*', '*', assignmentToken || solutionToken || user?.sub), 'evaluation');
  }

  @Get('solutions/:solution/evaluations/:id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Evaluation | null> {
    return this.evaluationService.find(id);
  }

  @Patch('solutions/:solution/evaluations/:id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateEvaluationDto,
  ): Promise<Evaluation | null> {
    return this.evaluationService.updateWithCodeSearch(id, dto);
  }

  @Delete('solutions/:solution/evaluations/:id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Evaluation | null> {
    return this.evaluationService.deleteWithCodeSearch(id);
  }
}
