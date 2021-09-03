import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, Get, Headers, Param, Patch, Post} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {notFound} from '../utils';
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
    const assignment = await this.assignmentService.findOne(id) ?? notFound(id);
    if (this.assignmentService.isAuthorized(assignment, token, user)) {
      return assignment;
    }
    return this.assignmentService.mask(assignment.toObject());
  }

  @Patch(':id')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignment})
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return await this.assignmentService.update(id, dto) ?? notFound(id);
  }

  @Delete(':id')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignment})
  @ApiNotFoundResponse()
  async remove(
    @Param('id') id: string,
  ) {
    return await this.assignmentService.remove(id) ?? notFound(id);
  }
}
