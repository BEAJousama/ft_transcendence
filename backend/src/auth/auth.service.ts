import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async getprofile(login: string) {
    let user = await this.usersService.findUserByLogin(login);
    return user;
  }

  async callback(req, res) {
    try {
      const data = req.user;
      let user = await this.usersService.findUserByLogin(data.login);
      if (!user) {
        user = await this.usersService.createUser({
          login: data.login,
          avatar: data.avatar,
          tfaSecret: '',
        });
      }
      const payload = { login: user.login, sub: user.id };
      const access_token = this.jwtService.sign(payload);
      res.cookie('access_token', access_token, {
        httpOnly: true,
      });
      res.status(302).redirect('http://localhost:5500/index.html');
    } catch (error) {
      return error;
    }
    // console.log(access_token);
  }
}
