import {Auth} from '@app/keycloak-auth';
import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiForbiddenResponse} from '@nestjs/swagger';
import {ProjectAuthGuard} from './project-auth.guard';

export function ProjectAuth(options: { forbiddenResponse: string }) {
  return applyDecorators(
    Auth({optional: true}),
    ApiForbiddenResponse({description: options.forbiddenResponse}),
    UseGuards(ProjectAuthGuard),
  );
}
