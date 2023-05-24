import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const authorizationHeader = req.headers.authorization;

        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
          const token = authorizationHeader.substring(7); // Remove the 'Bearer ' prefix

          return token;
        }

        return undefined;
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
