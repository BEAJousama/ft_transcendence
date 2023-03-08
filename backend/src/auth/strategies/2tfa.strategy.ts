import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const cookies = req?.headers?.cookie?.split(';');
        let token;
        if (cookies) {
          cookies.map((cookie) => {
            if (cookie.includes('2fa_access_token')) {
              token = cookie.split('=')[1];
            }
          });
        }
        return token;
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
