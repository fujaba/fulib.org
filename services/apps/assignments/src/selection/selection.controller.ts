import {EventPayload} from '@app/event/event.interface';
import {Body, Controller, MessageEvent, Param, Post, Query, Sse} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Observable, Subject} from 'rxjs';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {eventStream} from '../utils';
import {CreateSelectionDto, SelectionDto} from './selection.dto';
import {SelectionService} from './selection.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment')
@ApiTags('Selections')
export class SelectionController {
  private events$ = new Subject<EventPayload<SelectionDto>>();

  constructor(
    private selectionService: SelectionService,
  ) {
  }

  @EventPattern('selection.*.*')
  onEvent(@Payload() payload: EventPayload<SelectionDto>) {
    this.events$.next(payload);
  }

  @Post('solutions/:solution/selections')
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: SelectionDto})
  create(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Body() dto: CreateSelectionDto,
  ): SelectionDto {
    return this.selectionService.create(assignment, solution, dto);
  }

  @Sse('selections/events')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: SelectionDto})
  streamAll(
    @Param('assignment') assignment: string,
    @Query('author') author?: string,
  ): Observable<MessageEvent> {
    return eventStream(this.events$, 'selection', s => s.assignment === assignment && (!author || s.author === author));
  }

  @Sse('solutions/:solution/selections/events')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: SelectionDto})
  stream(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('author') author?: string,
  ): Observable<MessageEvent> {
    return eventStream(this.events$, 'selection', s => s.assignment === assignment && s.solution === solution && (!author || s.author === author));
  }
}
