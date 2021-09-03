import {Auth} from '@app/keycloak-auth';
import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiForbiddenResponse, ApiHeader} from '@nestjs/swagger';
import {SolutionAuthGuard} from './solution-auth.guard';

export function SolutionAuth(options: {forbiddenResponse: string}) {
  return applyDecorators(
    Auth({optional: true}),
    ApiForbiddenResponse({description: options.forbiddenResponse}),
    ApiHeader({name: 'assignment-token', required: false}),
    ApiHeader({name: 'solution-token', required: false}),
    UseGuards(SolutionAuthGuard),
  );
}
