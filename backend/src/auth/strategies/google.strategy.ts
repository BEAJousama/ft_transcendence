import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@Inject(UsersService)
    private readonly usersService: UsersService,) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    const username = emails[0].value.split('@')[0].replaceAll(/[_\-.]/g, '');
    const user = await this.usersService.findOrCreateUser(
      {login: username,
      email: emails[0].value,
      fullname: displayName,
      avatar: photos[0].value,
      phone: '',}
    )
    // const user = {
    //   id,
    //   login: username,
    //   email: emails[0].value,
    //   fullname: displayName,
    //   avatar: photos[0].value,
    //   phone: '',
    // };
    return user;
    // done(null, user);
  }
}