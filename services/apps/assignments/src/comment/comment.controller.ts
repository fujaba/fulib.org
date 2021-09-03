import {AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, Get, Headers, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from '../solution/solution-auth.decorator';
import {notFound} from '../utils';
import {CommentAuth} from './comment-auth.decorator';
import {CreateCommentDto, UpdateCommentDto} from './comment.dto';
import {Comment} from './comment.schema';
import {CommentService} from './comment.service';

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
    @Param('assignment') assignmentId: string,
    @Param('solution') solution: string,
    @Body() dto: CreateCommentDto,
    @AuthUser() user?: UserToken,
    @Headers('assignment-token') assignmentToken?: string,
  ) {
    const assignment = await this.assignmentService.findOne(assignmentId) ?? notFound(assignmentId);
    const distinguished = this.assignmentService.isAuthorized(assignment, assignmentToken, user);
    return this.commentService.create(assignmentId, solution, dto, distinguished, user?.sub);
  }

  @Get()
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: [Comment]})
  async findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
  ): Promise<Comment[]> {
    return this.commentService.findAll({assignment, solution});
  }

  @Get(':id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Comment})
  @ApiNotFoundResponse()
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
  ): Promise<Comment> {
    return await this.commentService.findOne(id) ?? notFound(id);
  }

  @Patch(':id')
  @CommentAuth({forbiddenResponse: forbiddenCommentResponse})
  @ApiOkResponse({type: Comment})
  @ApiNotFoundResponse()
  async update(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<UpdateCommentDto> {
    return await this.commentService.update(id, dto) ?? notFound(id);
  }

  @Delete(':id')
  @CommentAuth({forbiddenResponse: forbiddenCommentResponse})
  @ApiOkResponse({type: Comment})
  @ApiNotFoundResponse()
  async remove(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
  ): Promise<Comment> {
    return await this.commentService.remove(id) ?? notFound(id);
  }
}
