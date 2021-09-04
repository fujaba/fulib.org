import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags, getSchemaPath} from '@nestjs/swagger';
import {AssignmentAuth} from './assignment-auth.decorator';
import {CreateAssignmentDto, ReadAssignmentDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment} from './assignment.schema';
import {AssignmentService} from './assignment.service';

const forbiddenResponse = 'Not owner or invalid Assignment-Token.';

@Controller('assignments')
@ApiTags('Assignments')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
  ) {
  }

  @Post()
  @Auth({optional: true})
  @ApiCreatedResponse({type: Assignment})
  async create(
    @Body() dto: CreateAssignmentDto,
    @AuthUser() user?: UserToken,
  ) {
    return this.assignmentService.create(dto, user?.sub);
  }

  @Get()
  @ApiOkResponse({type: [ReadAssignmentDto]})
  async findAll(
    @Query('createdBy') createdBy?: string,
  ) {
    return this.assignmentService.findAll({createdBy});
  }

  @Get(':id')
  @Auth({optional: true})
  @NotFound()
  @ApiOkResponse({
    description: 'Result is an Assignment when you are author or the Assignment-Token header matches, otherwise some properties are omitted.',
    schema: {
      oneOf: [
        {$ref: getSchemaPath(Assignment)},
        {$ref: getSchemaPath(ReadAssignmentDto)},
      ],
    },
  })
  @ApiHeader({name: 'assignment-token', required: false})
  async findOne(
    @Param('id') id: string,
    @Headers('assignment-token') token?: string,
    @AuthUser() user?: UserToken,
  ): Promise<Assignment | ReadAssignmentDto> {
    const assignment = await this.assignmentService.findOne(id) ?? notFound(id);
    if (this.assignmentService.isAuthorized(assignment, user, token)) {
      return assignment;
    }
    return this.assignmentService.mask(assignment.toObject());
  }

  @Patch(':id')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignment})
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ): Promise<Assignment | null> {
    return this.assignmentService.update(id, dto);
  }

  @Delete(':id')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignment})
  async remove(
    @Param('id') id: string,
  ): Promise<Assignment | null> {
    return this.assignmentService.remove(id);
  }
}
