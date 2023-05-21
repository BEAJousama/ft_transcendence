import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CallbackDoc,
  LogoutDoc,
  ProfileDoc,
  TurnOffDoc,
  TurnOnDoc,
  VerifyDoc,
} from './auth.decorator';
import { AuthService } from './auth.service';
import { FourtyTwoGuard, JwtAuthGuard, Jwt2faAuthGuard } from './guards';
import { Public } from 'src/public.decorator';
import { Response } from 'express';
import * as qrcode from 'qrcode';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ProfileDoc()
  @Get('42')
  async fortyTwoLogin(@Req() req) {
    try {
      return this.authService.getprofile(req.user.login ? req.user.login : '');
    } catch (e) {
      throw e;
    }
  }

  @Public()
  @Get('42/login')
  async login() {
    try {
      return this.authService.getAccessToken();
    } catch (error) {}
  }

  @UseGuards(FourtyTwoGuard)
  @Public()
  @CallbackDoc()
  @Get('42/callback')
  async fortyTwoLoginCallback(@Req() req, @Res() res: Response) {
    try {
      await this.authService.callback(req);
      return res.redirect(process.env.FRONTEND_URL);
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
  async verifyTwoFactorAuthentication(@Req() req) {
    try {
      return await this.authService.verify(req);
    } catch (e) {
      throw e;
    }
  }
}
