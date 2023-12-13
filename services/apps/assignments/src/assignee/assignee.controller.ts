import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Put} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {BulkUpdateAssigneeDto, PatchAssigneeDto, UpdateAssigneeDto} from './assignee.dto';
import {Assignee} from './assignee.schema';
import {AssigneeService} from './assignee.service';
import {Types} from "mongoose";

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token';

@Controller()
@ApiTags('Assignees')
export class AssigneeController {
  constructor(
    private readonly assigneeService: AssigneeService,
  ) {
  }

  @Get('assignments/:assignment/assignees')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [Assignee]})
  async findAll(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
  ): Promise<Assignee[]> {
    return this.assigneeService.findAll({assignment}, {sort: {assignee: 1}});
  }

  @Get('assignments/:assignment/assignees/unique/:field')
  @ApiOperation({summary: 'Find unique values for a field in assignees.'})
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({isArray: true})
  async findUnique(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('field') field: keyof Assignee,
  ): Promise<unknown[]> {
    return this.assigneeService.distinct(field, {assignment});
  }

  @Patch('assignments/:assignment/assignees')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async updateMany(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Body(new ParseArrayPipe({ items: BulkUpdateAssigneeDto })) dtos: BulkUpdateAssigneeDto[],
  ): Promise<Assignee[]> {
    return this.assigneeService.upsertMany(assignment, dtos);
  }

  @Get('assignments/:assignment/solutions/:solution/assignee')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async findOne(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
  ) {
    return this.assigneeService.findOne({assignment, solution});
  }

  @Put('assignments/:assignment/solutions/:solution/assignee')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async update(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
    @Body() dto: UpdateAssigneeDto,
  ) {
    return this.assigneeService.upsert({assignment, solution}, dto);
  }

  @Patch('assignments/:assignment/solutions/:solution/assignee')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async patch(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
    @Body() dto: PatchAssigneeDto,
  ) {
    return this.assigneeService.updateOne({assignment, solution}, dto);
  }

  @Delete('assignments/:assignment/solutions/:solution/assignee')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async remove(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('solution', ObjectIdPipe) solution: Types.ObjectId,
  ) {
    return this.assigneeService.deleteOne({assignment, solution});
  }
}
