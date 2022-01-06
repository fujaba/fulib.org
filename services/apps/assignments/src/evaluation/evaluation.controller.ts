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
import {CreateEvaluationDto, UpdateEvaluationDto} from './evaluation.dto';
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

  @Get('evaluations')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [Evaluation]})
  @ApiQuery({name: 'file', required: false})
  @ApiQuery({name: 'task', required: false})
  async findByAssignment(
    @Param('assignment') assignment: string,
    @Query('file') file?: string,
    @Query('task') task?: string,
  ): Promise<Evaluation[]> {
    const where: FilterQuery<Evaluation> = {assignment};
    file && (where['snippets.file'] = file);
    task && (where.task = task);
    return this.evaluationService.findAll(where);
  }

  @Get('evaluations/unique/:field')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({isArray: true})
  @ApiQuery({name: 'task', required: false})
  async findUnique(
    @Param('assignment') assignment: string,
    @Param('field') field: string,
    @Query('task') task?: string,
    @Query('codeSearch') codeSearch?: string,
  ): Promise<unknown[]> {
    const where: FilterQuery<Evaluation> = {assignment};
    task && (where.task = task);
    if (codeSearch !== undefined) {
      where.author = codeSearch === 'true' ? 'Code Search' : {$ne: 'Code Search'};
    }
    return this.evaluationService.findUnique(field, where);
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
  @ApiQuery({name: 'file', required: false})
  @ApiQuery({name: 'task', required: false})
  async findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('file') file?: string,
    @Query('task') task?: string,
  ): Promise<Evaluation[]> {
    const where: FilterQuery<Evaluation> = {assignment, solution};
    file && (where['snippets.file'] = file);
    task && (where.task = task);
    return this.evaluationService.findAll(where);
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
