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
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';

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

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }

  async signUp(body: SignUpDto) {
    try {
      const secret = authenticator.generateSecret();

      const password: string = await this.hashPassword(body.password);
      const user = await this.usersService.createUser({
        login: body.username,
        avatar: '/img/default.jpg',
        tfaSecret: secret,
        fullname: body.fullname,
        phone: '',
        email: body.email,
        password: password,
      });
      return {
        message: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async signIn(body: SignInDto) {
    try {
      const user = await this.usersService.findUserByLogin(body.username);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isMatch = await this.verifyPassword(body.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (user.twoFactorAuth) {
        const payload = { login: user.login, sub: user.id, email: user.email };

        const access_token = this.jwtService.sign(payload, {
          secret: process.env.TFA_JWT_SECRET,
          expiresIn: '7d',
        });
        const accessToken = {
          name: '2fa_access_token',
          value: access_token,
        };
        return accessToken;
      }
      const payload = { login: user.login, sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
      });
      const accessToken = {
        name: 'access_token',
        value: access_token,
      };
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

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
        const payload = { login: user.login, sub: user.id, email: user.email };

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
      const payload = { login: user.login, sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
      });
      this.accessToken = {
        name: 'access_token',
        value: access_token,
      };
    } catch (error: any) {
      console.log(error);
      throw new InternalServerErrorException(error.response.message);
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
