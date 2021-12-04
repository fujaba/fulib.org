import {Body, Controller, Get, MessageEvent, Param, Post, Query, Sse} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {interval, map, mapTo, merge, Observable} from 'rxjs';
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

  @Get()
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: SelectionDto})
  findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('author') author?: string,
  ): SelectionDto[] {
    return this.selectionService.findAll(assignment, solution, author);
  }

  @Sse('events')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: SelectionDto})
  stream(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('author') author?: string,
  ): Observable<MessageEvent> {
    return merge(
      this.selectionService.stream(assignment, solution, author).pipe(map(data => ({data}))),
      interval(15000).pipe(mapTo({data: ''})),
    );
  }
}
