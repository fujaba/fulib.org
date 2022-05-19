import {AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {CreateTelemetryDto} from './telemetry.dto';
import {Telemetry} from './telemetry.schema';
import {TelemetryService} from './telemetry.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller()
@ApiTags('Telemetry')
export class TelemetryController {
  constructor(
    private readonly telemetryService: TelemetryService,
  ) {
  }

  @Post('assignments/:assignment/solutions/:solution/telemetry')
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: Telemetry})
  async create(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Body() dto: CreateTelemetryDto,
    @AuthUser() user?: UserToken,
  ): Promise<Telemetry> {
    return this.telemetryService.create(assignment, solution, dto, user?.sub);
  }
}
