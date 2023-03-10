import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { authenticator } from 'otplib';
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

  async callback(req, res: Response) {
    try {
      const data = req.user;
      let user: User = await this.usersService.findUserByLogin(data.login);
      if (!user) {
        const secret = authenticator.generateSecret();
        user = await this.usersService.createUser({
          login: data.login,
          avatar: data.avatar,
          tfaSecret: secret,
        });
      }
      if (user.twoFactorAuth) {
        const payload = { login: user.login, sub: user.id };

        const access_token = this.jwtService.sign(payload, {
          secret: process.env.TFA_JWT_SECRET,
          expiresIn: '7d',
        });
        res.cookie('2fa_access_token', access_token, {
          httpOnly: true,
        });
        // redirect to 2tf front end url
        res.status(302).redirect(process.env.FRONTEND_2FA_URL);
<<<<<<< HEAD
=======
        return;
>>>>>>> 46b41212ff104823bb94f4797fedef7883b758b3
      }
      const payload = { login: user.login, sub: user.id };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
      });
      res.cookie('access_token', access_token, {
        httpOnly: true,
      });
      res.status(302).redirect(process.env.FRONTEND_URL);
    } catch (error) {
      return error;
    }
  }

  async turnOnTwoFactorAuthentication(login: string) {
    try {
      const user: User = await this.usersService.findUserByLogin(login);
      if (user) {
        user.twoFactorAuth = true;
        await this.usersService.updateUser({ user });
      }
      return {
        message: 'success',
      };
    } catch (error) {
      return {
        message: 'error',
      };
    }
  }

  async verify(req, res) {
    const user = await this.getprofile(req.user.login);
    const { code } = req.body;
    const isvalid = this.verifyTwoFactorAuthentication(code, user);
    if (isvalid === true) {
      const payload = { login: user.login, sub: user.id };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
      });
      res.cookie('access_token', access_token, {
        httpOnly: true,
      });
    }
    return {
      isvalid,
    };
  }
  async turnOffTwoFactorAuthentication(login: string) {
    try {
      const user: User = await this.usersService.findUserByLogin(login);

      if (user) {
        user.twoFactorAuth = false;
        await this.usersService.updateUser({ user });
      }
      return {
        message: 'success',
      };
    } catch (error) {
      return {
        message: 'error',
      };
    }
  }

  verifyTwoFactorAuthentication(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.tfaSecret,
    });
  }

  async generateQrCodeDataURl(user: User) {
    try {
      const otpauthUrl = authenticator.keyuri(
        user.login,
        'FT_TRANSCENDENCE',
        user.tfaSecret,
      );
      return otpauthUrl;
    } catch (error) {}
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('2fa_access_token');
    res.status(302).redirect(process.env.FRONTEND_URL);
  }
}
