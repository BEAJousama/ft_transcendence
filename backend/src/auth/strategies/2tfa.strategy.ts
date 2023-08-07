import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        if (
          req.cookies &&
          '2fa_access_token' in req.cookies &&
          req.cookies['2fa_access_token'].length > 0
        ) {
          return req.cookies['2fa_access_token'];
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.TFA_JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // don't forget to pass the correct user
    return { userId: payload.sub, login: payload.login };
  }
}
