import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound, ObjectIdArrayPipe, ObjectIdPipe} from '@mean-stream/nestx';
import {
  Body,
  Controller, DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags, getSchemaPath} from '@nestjs/swagger';
import {FilterQuery, Types, UpdateQuery} from 'mongoose';
import {AssignmentAuth} from './assignment-auth.decorator';
import {CreateAssignmentDto, ReadAssignmentDto, UpdateAssignmentDto,} from './assignment.dto';
import {Assignment, ASSIGNMENT_COLLATION, ASSIGNMENT_SORT} from './assignment.schema';
import {AssignmentService} from './assignment.service';
import {MemberService} from "@app/member";
import {generateToken} from "../utils";

const forbiddenResponse = 'Not owner or invalid Assignment-Token.';

@Controller('assignments')
@ApiTags('Assignments')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly memberService: MemberService,
  ) {
  }

  @Post()
  @Auth({optional: true})
  @ApiCreatedResponse({type: Assignment})
  async create(
    @Body() dto: CreateAssignmentDto,
    @AuthUser() user?: UserToken,
  ) {
    return this.assignmentService.create({
      ...dto,
      token: generateToken(),
      createdBy: user?.sub,
    });
  }

  @Get()
  @ApiOkResponse({type: [ReadAssignmentDto]})
  async findAll(
    @Query('ids', new DefaultValuePipe([]), ParseArrayPipe, ObjectIdArrayPipe) ids: Types.ObjectId[],
    @Query('archived', new ParseBoolPipe({optional: true})) archived?: boolean,
    @Query('createdBy') createdBy?: string,
    @Query('members', new ParseArrayPipe({optional: true})) memberIds?: string[],
  ) {
    const filter: FilterQuery<Assignment> = {};
    if (archived !== undefined) {
      filter.archived = archived || {$ne: true};
    }
    if (createdBy) {
      (filter.$or ||= []).push({createdBy});
    }
    if (ids.length) {
      (filter.$or ||= []).push({_id: {$in: ids}});
    }
    if (memberIds) {
      const members = await this.memberService.findAll({user: {$in: memberIds}});
      (filter.$or ||= []).push({_id: {$in: members.map(m => m.parent)}});
    }
    return (await this.assignmentService.findAll(filter, {
      sort: ASSIGNMENT_SORT,
      collation: ASSIGNMENT_COLLATION,
    })).map(a => this.assignmentService.mask(a.toObject()));
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
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Headers('assignment-token') token?: string,
    @AuthUser() user?: UserToken,
  ): Promise<Assignment | ReadAssignmentDto> {
    const assignment = await this.assignmentService.find(id) ?? notFound(id);
    if (await this.assignmentService.isAuthorized(assignment, user, token)) {
      return assignment;
    }
    return this.assignmentService.mask(assignment.toObject());
  }

  @Patch(':id')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignment})
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateAssignmentDto,
  ): Promise<Assignment | null> {
    const {token, classroom, ...rest} = dto;
    const update: UpdateQuery<Assignment> = rest;
    if (token) {
      update.token = generateToken();
    }
    if (classroom) {
      // need to flatten the classroom object to prevent deleting the GitHub token all the time
      for (const [key, value] of Object.entries(classroom)) {
        update[`classroom.${key}`] = value;
      }
    }
    return this.assignmentService.update(id, dto);
  }

  @Delete(':id')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignment})
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Assignment | null> {
    return this.assignmentService.delete(id);
  }
}
