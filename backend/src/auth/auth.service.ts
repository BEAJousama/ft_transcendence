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
      return this.signIn({ username: body.username, password: body.password });
    } catch (error) {
      throw error;
    }
  }

  async signIn(body: SignInDto) {
    try {
      const user = await this.usersService.findUserByLogin(body.username);
      if (!user) {
        throw new UnauthorizedException('Incorrect username or password');
      }
      const isMatch = await this.verifyPassword(body.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect username or password');
      }
      if (user.twoFactorAuth === true) {
        const payload = { login: user.login, sub: user.id };
        const access_token = this.jwtService.sign(payload, {
          secret: process.env.TFA_JWT_SECRET,
          expiresIn: '24h',
        });

        return {
          name: '2fa_access_token',
          value: access_token,
        };
      }
      const payload = { login: user.login, sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      });
      return {
        name: 'access_token',
        value: access_token,
      };
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

  async callback(req, res) {
    try {
      if (!req.user) {
        res.redirect(process.env.FRONTEND_URL);
        res.end();
      }
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

      if (user.twoFactorAuth === true) {
        const payload = { login: user.login, sub: user.id };
        const access_token = this.jwtService.sign(payload, {
          secret: process.env.TFA_JWT_SECRET,
          expiresIn: '24h',
        });

        res.cookie('2fa_access_token', access_token);
        res.redirect(process.env.FRONTEND_URL);
        res.end();
        return;
      }

      const payload = { login: user.login, sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      });
      res.cookie('access_token', access_token);
      if (user.createdAt === user.updatedAt)
        res.cookie('complete_info', 'complete your info');
      res.redirect(process.env.FRONTEND_URL);
      res.end();
      return;
    } catch (error: any) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async turnOnTwoFactorAuthentication(req) {
    try {
      const user = await this.usersService.findUserByLogin(req.user.login);
      const isvalid = await this.verifyTwoFactorAuthentication(
        req.body.code,
        user,
      );
      if (isvalid && user) {
        await this.usersService.updateUser({
          user: {
            twoFactorAuth: true,
          },
          id: user.id,
        });
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

  async turnOffTwoFactorAuthentication(req) {
    try {
      const user = await this.usersService.findUserByLogin(req.user.login);
      const isvalid = await this.verifyTwoFactorAuthentication(
        req.body.code,
        user,
      );
      if (isvalid && user) {
        await this.usersService.updateUser({
          user: {
            twoFactorAuth: false,
          },
          id: user.id,
        });
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

  async verify(req, res) {
    try {
      const user = await this.getprofile(req.user.login);

      const { code } = req.body;

      const isvalid = this.verifyTwoFactorAuthentication(code, user);

      if (isvalid === true) {
        const payload = { login: user.login, sub: user.id };
        const access_token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '7d',
        });

        res.cookie('access_token', access_token);
        return {
          message: 'success',
        };
      }
      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  verifyTwoFactorAuthentication(twoFactorAuthenticationCode: string, user) {
    try {
      if (!user || !user.tfaSecret || !twoFactorAuthenticationCode)
        return false;

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
