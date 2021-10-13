import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Headers, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from '../solution/solution-auth.decorator';
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
  ): Promise<Comment> {
    const assignment = await this.assignmentService.findOne(assignmentId) ?? notFound(assignmentId);
    const distinguished = this.assignmentService.isAuthorized(assignment, user, assignmentToken);
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
  @NotFound()
  @ApiOkResponse({type: Comment})
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
  ): Promise<Comment | null> {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @CommentAuth({forbiddenResponse: forbiddenCommentResponse})
  @NotFound()
  @ApiOkResponse({type: Comment})
  async update(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<Comment | null> {
    return this.commentService.update(id, dto);
  }

  @Delete(':id')
  @CommentAuth({forbiddenResponse: forbiddenCommentResponse})
  @NotFound()
  @ApiOkResponse({type: Comment})
  async remove(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
  ): Promise<Comment | null> {
    return this.commentService.remove(id);
  }
}
