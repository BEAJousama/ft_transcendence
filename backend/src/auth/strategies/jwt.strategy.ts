import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const cookies = req?.headers?.cookie?.split(';');
        let token;
        if (cookies) {
          cookies.map((cookie) => {
            if (cookie.includes('access_token')) {
              token = cookie.split('=')[1];
            }
          });
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, login: payload.login };
  }
}
