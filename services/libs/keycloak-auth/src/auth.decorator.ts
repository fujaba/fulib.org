import {UserToken} from '@app/keycloak-auth/auth.interface';
import {JwtAuthGuard} from '@app/keycloak-auth/jwt-auth.guard';
import {applyDecorators, createParamDecorator, ExecutionContext, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth, ApiUnauthorizedResponse} from '@nestjs/swagger';

export const DEFAULT_DESCRIPTION = 'Missing or invalid Bearer token.';

export function Auth(options: {optional?: boolean}) {
  return applyDecorators(
    UseGuards(options.optional ? JwtAuthGuard : AuthGuard('jwt')),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: DEFAULT_DESCRIPTION,
    }),
  );
}

export const AuthUser = createParamDecorator<unknown, unknown, UserToken>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
