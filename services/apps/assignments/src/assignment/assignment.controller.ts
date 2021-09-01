import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, ForbiddenException, Get, Headers, Param, Patch, Post} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {notFound} from '../utils';
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
  async findAll() {
    return this.assignmentService.findAll();
  }

  @Get(':id')
  @Auth({optional: true})
  @ApiOkResponse({
    description: 'Result is an Assignment when you are author or the Assignment-Token header matches, otherwise some properties are omitted.',
    schema: {
      oneOf: [
        {$ref: getSchemaPath(Assignment)},
        {$ref: getSchemaPath(ReadAssignmentDto)},
      ],
    },
  })
  @ApiNotFoundResponse()
  @ApiHeader({name: 'assignment-token', required: false})
  async findOne(
    @Param('id') id: string,
    @Headers('assignment-token') token?: string,
    @AuthUser() user?: UserToken,
  ) {
    console.log(user);
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment) {
      notFound(id);
    }
    if (this.assignmentService.isAuthorized(assignment, token, user)) {
      return assignment;
    }
    return this.assignmentService.mask(assignment.toObject());
  }

  @Patch(':id')
  @Auth({optional: true})
  @ApiOkResponse({type: Assignment})
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @Headers('assignment-token') token?: string,
    @AuthUser() user?: UserToken,
  ) {
    await this.checkAuth(id, token, user);
    return await this.assignmentService.update(id, dto) ?? notFound(id);
  }

  @Delete(':id')
  @Auth({optional: true})
  @ApiOkResponse({type: Assignment})
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  async remove(
    @Param('id') id: string,
    @Headers('assignment-token') token?: string,
    @AuthUser() user?: UserToken,
  ) {
    await this.checkAuth(id, token, user);
    return await this.assignmentService.remove(id) ?? notFound(id);
  }

  private async checkAuth(id: string, token: string, user: UserToken) {
    const assignment = await this.assignmentService.findOne(id);
    if (!assignment) {
      notFound(id);
    }
    if (!this.assignmentService.isAuthorized(assignment, token, user)) {
      throw new ForbiddenException(forbiddenResponse);
    }
  }
}
