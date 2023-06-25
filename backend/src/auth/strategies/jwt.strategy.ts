import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(UsersService)
    private readonly usersService: UsersService,) {
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
    const user = await this.usersService.findOrCreateUser(
      {login: payload.login,
      email: "",
      fullname: "",
      avatar: "",
      phone: '',}
    )
    // return { userId: payload.sub, login: payload.login };
    return user;
  }
}