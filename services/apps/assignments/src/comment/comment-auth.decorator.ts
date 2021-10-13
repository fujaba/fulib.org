import {Auth} from '@app/keycloak-auth';
import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiForbiddenResponse} from '@nestjs/swagger';
import {CommentAuthGuard} from './comment-auth.guard';

export function CommentAuth(options: { forbiddenResponse: string }) {
  return applyDecorators(
    Auth(),
    ApiForbiddenResponse({description: options.forbiddenResponse}),
    UseGuards(CommentAuthGuard),
  );
}
