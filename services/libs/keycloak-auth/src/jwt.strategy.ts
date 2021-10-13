import {AuthOptions, UserToken} from '@app/keycloak-auth/auth.interface';
import {Inject, Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';

export const OPTIONS = Symbol();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(OPTIONS) options: AuthOptions,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.publicKey,
      algorithms: options.algorithms,
      issuer: options.issuer,
    });
  }

  async validate(token: UserToken): Promise<UserToken> {
    return token;
  }
}
