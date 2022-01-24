import {EventPayload} from '@app/event/event.interface';
import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Query, Sse} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import {ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {FilterQuery} from 'mongoose';
import {Observable, Subject} from 'rxjs';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {SolutionAuth} from '../solution/solution-auth.decorator';
import {eventStream} from '../utils';
import {CreateEvaluationDto, FilterEvaluationParams, UpdateEvaluationDto} from './evaluation.dto';
import {Evaluation} from './evaluation.schema';
import {EvaluationService} from './evaluation.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment')
@ApiTags('Evaluations')
export class EvaluationController {
  private events$ = new Subject<EventPayload<Evaluation>>();

  constructor(
    private readonly evaluationService: EvaluationService,
  ) {
  }

  @EventPattern('evaluation.*.*')
  onEvent(@Payload() payload: EventPayload<Evaluation>) {
    this.events$.next(payload);
  }

  private toQuery(assignment: string, solution?: string, params: FilterEvaluationParams = {}): FilterQuery<Evaluation> {
    const query: FilterQuery<Evaluation> = {assignment, solution};
    params.file && (query['snippets.file'] = params.file);
    params.task && (query.task = params.task);
    params.origin && (query['codeSearch.origin'] = params.origin);
    if (params.codeSearch !== undefined) {
      query.author = params.codeSearch ? 'Code Search' : {$ne: 'Code Search'};
    }
    return query;
  }

  @Get('evaluations')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [Evaluation]})
  async findByAssignment(
    @Param('assignment') assignment: string,
    @Query() params?: FilterEvaluationParams,
  ): Promise<Evaluation[]> {
    return this.evaluationService.findAll(this.toQuery(assignment, undefined, params));
  }

  @Get('evaluations/unique/:field')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({isArray: true})
  async findUnique(
    @Param('assignment') assignment: string,
    @Param('field') field: string,
    @Query() params?: FilterEvaluationParams,
  ): Promise<unknown[]> {
    return this.evaluationService.findUnique(field, this.toQuery(assignment, undefined, params));
  }

  @Get('evaluations/:id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async findOneByAssignment(
    @Param('assignment') assignment: string,
    @Param('id') id: string,
  ): Promise<Evaluation | null> {
    return this.evaluationService.findOne(id);
  }

  @Post('solutions/:solution/evaluations')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiCreatedResponse({type: Evaluation})
  async create(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Body() dto: CreateEvaluationDto,
    @AuthUser() user?: UserToken,
  ): Promise<Evaluation> {
    return this.evaluationService.create(assignment, solution, dto, user?.sub);
  }

  @Get('solutions/:solution/evaluations')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: [Evaluation]})
  async findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query() params?: FilterEvaluationParams,
  ): Promise<Evaluation[]> {
    return this.evaluationService.findAll(this.toQuery(assignment, solution, params));
  }

  @Sse('solutions/:solution/evaluations/events')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Evaluation})
  stream(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
  ): Observable<MessageEvent> {
    return eventStream(this.events$, 'evaluation', e => e.assignment === assignment && e.solution === solution);
  }

  @Get('solutions/:solution/evaluations/:id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
  ): Promise<Evaluation | null> {
    return this.evaluationService.findOne(id);
  }

  @Patch('solutions/:solution/evaluations/:id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEvaluationDto,
  ): Promise<Evaluation | null> {
    return this.evaluationService.update(id, dto);
  }

  @Delete('solutions/:solution/evaluations/:id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Evaluation})
  @NotFound()
  async remove(
    @Param('id') id: string,
  ): Promise<Evaluation | null> {
    return this.evaluationService.remove(id);
  }
}
