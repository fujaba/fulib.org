import {Auth} from '@app/keycloak-auth';
import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiForbiddenResponse} from '@nestjs/swagger';
import {MemberAuthGuard} from './member-auth.guard';

export function MemberAuth(options: { forbiddenResponse: string }) {
  return applyDecorators(
    Auth(),
    ApiForbiddenResponse({description: options.forbiddenResponse}),
    UseGuards(MemberAuthGuard),
  );
}
