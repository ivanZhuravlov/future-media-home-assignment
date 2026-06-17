import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/configuration';
import { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../../users/users.service';
import { REFRESH_COOKIE_NAME } from '../auth.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request) =>
        req.cookies?.[REFRESH_COOKIE_NAME] ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtRefreshSecret', { infer: true }),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayloadUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, email: user.email };
  }
}
