import {JwtAuthGuard} from '@app/keycloak-auth/jwt-auth.guard';
import {applyDecorators, createParamDecorator, ExecutionContext, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth, ApiUnauthorizedResponse} from '@nestjs/swagger';

export const DEFAULT_DESCRIPTION = 'Missing or invalid Bearer token.';

export function Auth(options?: {optional?: boolean}) {
  const decorators = [
    UseGuards(options?.optional ? JwtAuthGuard : AuthGuard('jwt')),
    ApiBearerAuth(),
  ];
  if (!options?.optional) {
    decorators.push(ApiUnauthorizedResponse({
      description: DEFAULT_DESCRIPTION,
    }));
  }
  return applyDecorators(...decorators);
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
