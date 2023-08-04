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
        const cookies = document.cookie;
        const cookieArray = cookies.split(';');

        // Assuming the access token is stored in a cookie named "access_token"
        const tokenCookie = cookieArray.find((cookie) =>
          cookie.trim().startsWith('access_token='),
        );

        if (tokenCookie) {
          const token = tokenCookie.split('=')[1];
          return token.trim();
        } else {
          return undefined; // If the access token cookie is not found
        }
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
