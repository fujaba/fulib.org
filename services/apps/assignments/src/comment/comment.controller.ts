import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Headers, MessageEvent, Param, Patch, Post, Sse} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Observable} from 'rxjs';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from '../solution/solution-auth.decorator';
import {eventStream} from '../utils';
import {CommentAuth} from './comment-auth.decorator';
import {CreateCommentDto, UpdateCommentDto} from './comment.dto';
import {Comment} from './comment.schema';
import {CommentService} from './comment.service';
import {Types} from "mongoose";

const forbiddenResponse = 'Not owner of assignment or solution, or invalid Assignment-Token or Solution-Token.';
const forbiddenCommentResponse = 'Not owner of comment.';

@Controller('assignments/:assignment/solutions/:solution/comments')
@ApiTags('Comments')
export class CommentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly commentService: CommentService,
  ) {
  }

  @Post()
  @SolutionAuth({forbiddenResponse})
  @ApiCreatedResponse({type: Comment})
  async create(
    @Param('assignment', ObjectIdPipe) assignmentId: Types.ObjectId,
    @Param('solution') solution: string,
    @Body() dto: CreateCommentDto,
    @AuthUser() user?: UserToken,
    @Headers('assignment-token') assignmentToken?: string,
  ): Promise<Comment> {
    const assignment = await this.assignmentService.find(assignmentId) ?? notFound(assignmentId);
    const distinguished = await this.assignmentService.isAuthorized(assignment, user, assignmentToken);
    return this.commentService.create({
      ...dto,
      assignment: assignmentId.toString(),
      solution,
      timestamp: new Date(),
      createdBy: user?.sub,
      distinguished,
    });
  }

  @Sse('events')
  @SolutionAuth({forbiddenResponse})
  events(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @AuthUser() user?: UserToken,
    @Headers('assignment-token') assignmentToken?: string,
    @Headers('solution-token') solutionToken?: string,
  ): Observable<MessageEvent> {
    return eventStream(this.commentService.subscribe(assignment, solution, '*', '*', assignmentToken || solutionToken || user?.sub), 'comment');
  }

  @Get()
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: [Comment]})
  async findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
  ): Promise<Comment[]> {
    return this.commentService.findAll({assignment, solution}, {sort: {timestamp: 1}});
  }

  @Get(':id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Comment})
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Comment | null> {
    return this.commentService.find(id);
  }

  @Patch(':id')
  @CommentAuth({forbiddenResponse: forbiddenCommentResponse})
  @NotFound()
  @ApiOkResponse({type: Comment})
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateCommentDto,
  ): Promise<Comment | null> {
    return this.commentService.update(id, dto);
  }

  @Delete(':id')
  @CommentAuth({forbiddenResponse: forbiddenCommentResponse})
  @NotFound()
  @ApiOkResponse({type: Comment})
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Comment | null> {
    return this.commentService.delete(id);
  }
}
