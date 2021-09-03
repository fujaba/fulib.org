import {Auth} from '@app/keycloak-auth';
import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiForbiddenResponse, ApiHeader} from '@nestjs/swagger';
import {AssignmentAuthGuard} from './assignment-auth.guard';

export function AssignmentAuth(options: {forbiddenResponse: string}) {
  return applyDecorators(
    Auth({optional: true}),
    ApiForbiddenResponse({description: options.forbiddenResponse}),
    ApiHeader({name: 'assignment-token', required: false}),
    UseGuards(AssignmentAuthGuard),
  );
}
