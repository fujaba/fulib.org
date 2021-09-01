import { Module } from '@nestjs/common';
import { KeycloakAuthService } from './keycloak-auth.service';

@Module({
  providers: [KeycloakAuthService],
  exports: [KeycloakAuthService],
})
export class KeycloakAuthModule {}
