import {AuthOptions} from '@app/keycloak-auth/auth.interface';
import {JwtStrategy, OPTIONS} from '@app/keycloak-auth/jwt.strategy';
import {DynamicModule, Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';

@Module({})
export class AuthModule {
  static register(options: AuthOptions): DynamicModule {
    const jwt = JwtModule.register({
      publicKey: options.publicKey,
      verifyOptions: {
        algorithms: options.algorithms as any[],
        issuer: options.issuer,
      },
    });

    return {
      module: AuthModule,
      imports: [
        jwt,
      ],
      providers: [
        JwtStrategy,
        {
          provide: OPTIONS,
          useValue: options,
        },
      ],
      exports: [
        JwtModule,
        JwtStrategy,
      ],
    };
  }
}
