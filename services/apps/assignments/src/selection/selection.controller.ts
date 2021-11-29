import {Body, Controller, MessageEvent, Param, Post, Query, Sse} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {map, Observable} from 'rxjs';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {CreateSelectionDto, SelectionDto} from './selection.dto';
import {SelectionService} from './selection.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment/solutions/:solution/selections')
@ApiTags('Selections')
export class SelectionController {
  constructor(
    private selectionService: SelectionService,
  ) {
  }

  @Post()
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: SelectionDto})
  create(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Body() dto: CreateSelectionDto,
  ): SelectionDto {
    return this.selectionService.create(assignment, solution, dto);
  }

  @Sse()
  // @AssignmentAuth({forbiddenResponse}) // FIXME not possible with EventSource...
  @ApiOkResponse({type: SelectionDto})
  stream(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('author') author?: string,
  ): Observable<MessageEvent> {
    return this.selectionService.stream(assignment, solution, author).pipe(
      map(selection => ({data: selection})),
    );
  }
}
