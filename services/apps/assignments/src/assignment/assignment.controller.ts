import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound} from '@app/not-found';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags, getSchemaPath} from '@nestjs/swagger';
import {AssignmentAuth} from './assignment-auth.decorator';
import {
  CheckNewRequestDto,
  CheckRequestDto,
  CheckResponseDto,
  CreateAssignmentDto,
  ReadAssignmentDto,
  UpdateAssignmentDto,
} from './assignment.dto';
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
    @Query('archived', new DefaultValuePipe(false), ParseBoolPipe) archived: boolean,
    @Query('createdBy') createdBy?: string,
  ) {
    return this.assignmentService.findAll({createdBy, archived: archived ? true : {$ne: true}});
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

  @Post('check')
  @ApiOkResponse({type: CheckResponseDto})
  async checkNew(
    @Body() dto: CheckNewRequestDto,
  ): Promise<CheckResponseDto> {
    return {
      results: await this.assignmentService.check(dto.solution, dto),
    };
  }

  @Post(':id/check')
  @NotFound()
  @ApiOkResponse({type: CheckResponseDto})
  async check(
    @Param('id') id: string,
    @Body() dto: CheckRequestDto,
  ): Promise<CheckResponseDto> {
    const assignment = await this.assignmentService.findOne(id) ?? notFound(id);
    return {
      results: await this.assignmentService.check(dto.solution, assignment),
    };
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
