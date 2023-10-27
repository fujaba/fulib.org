import {Auth} from '@app/keycloak-auth';
import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiForbiddenResponse} from '@nestjs/swagger';
import {CourseAuthGuard} from './course-auth.guard';

export function CourseAuth(options: { forbiddenResponse: string }) {
  return applyDecorators(
    Auth(),
    ApiForbiddenResponse({description: options.forbiddenResponse}),
    UseGuards(CourseAuthGuard),
  );
}
