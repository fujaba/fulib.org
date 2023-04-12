import {EventPayload} from '@app/event/event.interface';
import {AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Headers, MessageEvent, Param, Post, Query, Sse} from '@nestjs/common';
import {EventPattern, Payload} from '@nestjs/microservices';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {filter, Observable, Subject} from 'rxjs';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {eventStream} from '../utils';
import {CreateSelectionDto, SelectionDto} from './selection.dto';
import {SelectionService} from './selection.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment')
@ApiTags('Selections')
export class SelectionController {
  constructor(
    private selectionService: SelectionService,
  ) {
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
    @AuthUser() user?: UserToken,
    @Headers('assignment-token') assignmentToken?: string,
    @Query('author') author?: string,
  ): Observable<MessageEvent> {
    return eventStream(this.selectionService.subscribe(assignment, '*', '*', assignmentToken || user?.sub, author), 'selection');
  }

  @Sse('solutions/:solution/selections/events')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: SelectionDto})
  stream(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @AuthUser() user?: UserToken,
    @Headers('assignment-token') assignmentToken?: string,
    @Query('author') author?: string,
  ): Observable<MessageEvent> {
    return eventStream(this.selectionService.subscribe(assignment, '*', '*', assignmentToken || user?.sub, author), 'selection');
  }
}
