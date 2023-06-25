import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(@Inject(UsersService)
    private readonly usersService: UsersService,) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: process.env.FORTYTWO_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { login, image, id, displayname, phone, email } = profile._json;
    const user = await this.usersService.findOrCreateUser(
      {login,
      avatar: image.link,
      fullname: displayname,
      phone: phone === 'hidden' ? '' : phone,
      email,}
    )
    // return {
    //   id,
    //   login,
    //   avatar: image.link,
    //   fullname: displayname,
    //   phone: phone === 'hidden' ? '' : phone,
    //   email,
    // };
    // console.log(user)
    // console.log(user)
    return user;
  }
}