import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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
  private accessToken: {
    name: string;
    value: string;
  };

  async getprofile(login: string) {
    try {
      let user = await this.usersService.findUserByLogin(login);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  async getAccessToken() {
    const token = this.accessToken;
    this.accessToken = {
      name: '',
      value: '',
    };
    return token;
  }

  async callback(req) {
    try {
      if (!req.user) throw new UnauthorizedException();
      const data = req.user;
      let user: User = await this.usersService.findUserByLogin(data.login);
      if (!user) {
        const secret = authenticator.generateSecret();
        user = await this.usersService.createUser({
          login: data.login,
          avatar: data.avatar,
          tfaSecret: secret,
          fullname: data.fullname,
          phone: data.phone,
          email: data.email,
        });
      }

      if (user.twoFactorAuth) {
        const payload = { login: user.login, sub: user.id };

        const access_token = this.jwtService.sign(payload, {
          secret: process.env.TFA_JWT_SECRET,
          expiresIn: '7d',
        });
        this.accessToken = {
          name: '2fa_access_token',
          value: access_token,
        };
        return;
      }
      const payload = { login: user.login, sub: user.id };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
      });
      this.accessToken = {
        name: 'access_token',
        value: access_token,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  async turnOnTwoFactorAuthentication(req) {
    try {
      const isvalid = await this.verify(req);
      if (isvalid) {
        const user: User = await this.usersService.findUserByLogin(
          req.user.login ? req.user.login : '',
        );
        user.twoFactorAuth = true;
        await this.usersService.updateUser({ user }, user.id);
        return {
          message: 'success',
        };
      }
      return {
        message: 'fail',
      };
    } catch (error) {
      // console.log(error);
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  async turnOffTwoFactorAuthentication(req) {
    try {
      const isvalid = await this.verify(req);
      if (isvalid) {
        const user: User = await this.usersService.findUserByLogin(
          req.user.login ? req.user.login : '',
        );
        user.twoFactorAuth = false;
        await this.usersService.updateUser({ user }, user.id);
        return {
          message: 'success',
        };
      }
      return {
        message: 'fail',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  async verify(req) {
    try {
      const user = await this.getprofile(req.user.login);
      const { code } = req.body;
      const isvalid = this.verifyTwoFactorAuthentication(code, user);
      if (isvalid === true) {
        const payload = { login: user.login, sub: user.id };
        const access_token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '24h',
        });
        return {
          access_token,
        };
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  verifyTwoFactorAuthentication(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    try {
      return authenticator.verify({
        token: twoFactorAuthenticationCode,
        secret: user.tfaSecret,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  async generateQrCodeDataUrl(login: string) {
    try {
      const user = await this.getprofile(login);
      const otpauthUrl = authenticator.keyuri(
        user.login,
        'FT_TRANSCENDENCE',
        user.tfaSecret,
      );
      return otpauthUrl;
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }
}
