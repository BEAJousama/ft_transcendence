import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  InternalServerErrorException,
  Body,
} from '@nestjs/common';
import {
  CallbackDoc,
  GoogleCallbackDoc,
  GoogleLoginDoc,
  LoginDoc,
  ProfileDoc,
  SignInDoc,
  SignUpDoc,
  TurnOffDoc,
  TurnOnDoc,
  VerifyDoc,
} from './auth.decorator';
import { AuthService } from './auth.service';
import { FourtyTwoGuard, Jwt2faAuthGuard } from './guards';
import { Public } from 'src/public.decorator';
import { Response } from 'express';
import * as qrcode from 'qrcode';

import { GoogleGuard } from './guards/google.guard';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('google/login')
  @UseGuards(GoogleGuard)
  @GoogleLoginDoc()
  async googleAuth(@Req() req) {}

  @Public()
  @Get('google/callback')
  @GoogleCallbackDoc()
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const accesToken = await this.authService.callback(req);
    res.cookie(accesToken.name, accesToken.value);
    res.redirect(process.env.FRONTEND_URL);
    res.end();
  }

  @Public()
  @Post('signin')
  @SignInDoc()
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }

  @Public()
  @Post('signup')
  @SignUpDoc()
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @ProfileDoc()
  @Get('42')
  async fortyTwoLogin(@Req() req) {
    try {
      return this.authService.getprofile(req.user.login ? req.user.login : '');
    } catch (e) {
      throw e;
    }
  }

  // @Public()
  // @LoginDoc()
  // @Get('42/login')
  // async login() {
  //   try {
  //     return this.authService.getAccessToken();
  //   } catch (error) {}
  // }

  @UseGuards(FourtyTwoGuard)
  @Public()
  @CallbackDoc()
  @Get('42/callback')
  async fortyTwoLoginCallback(@Req() req, @Res() res: Response) {
    try {
      const accesToken = await this.authService.callback(req);
      res.cookie(accesToken.name, accesToken.value);
      res.redirect(process.env.FRONTEND_URL);
      res.end();
      // return res.redirect(process.env.FRONTEND_URL);
    } catch (e) {
      throw e;
    }
  }

  @Get('2fa/qrcode')
  async generateQrCodeDataUrl(@Req() req) {
    try {
      const otpauthUrl = await this.authService.generateQrCodeDataUrl(
        req.user.login ? req.user.login : '',
      );
      const qrCode = await qrcode.toDataURL(otpauthUrl);
      return qrCode;
    } catch {
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  @TurnOnDoc()
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(@Req() req) {
    try {
      return this.authService.turnOnTwoFactorAuthentication(req);
    } catch (e) {
      throw e;
    }
  }
  @TurnOffDoc()
  @Post('2fa/turn-off')
  async turnOffTwoFactorAuthentication(@Req() req) {
    try {
      return this.authService.turnOffTwoFactorAuthentication(req);
    } catch (e) {
      throw e;
    }
  }

  @Public()
  @UseGuards(Jwt2faAuthGuard)
  @VerifyDoc()
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(@Req() req, @Res() res) {
    try {
      const value = await this.authService.verify(req);
      if (value) {
        res.cookie('access_token', value.access_token);
      }
      res.send(value);
    } catch (e) {
      throw e;
    }
  }
}
