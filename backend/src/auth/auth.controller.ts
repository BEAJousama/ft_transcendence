import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @ProfileDoc()
  @Get('42')
  async fortyTwoLogin(@Req() req) {
    try {
      return this.authService.getprofile(req.user.login ? req.user.login : '');
    } catch (e) {}
  }

  @UseGuards(FourtyTwoGuard)
  @CallbackDoc()
  @Get('42/callback')
  async fortyTwoLoginCallback(@Req() req, @Res() res) {
    try {
      return this.authService.callback(req, res);
    } catch (e) {}
  }

  @UseGuards(JwtAuthGuard)
  @TurnOnDoc()
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(@Req() req) {
    try {
      return this.authService.turnOnTwoFactorAuthentication(req.user.login);
    } catch (e) {}
  }

  @UseGuards(JwtAuthGuard)
  @TurnOffDoc()
  @Post('2fa/turn-off')
  async turnOffTwoFactorAuthentication(@Req() req) {
    try {
      return this.authService.turnOffTwoFactorAuthentication(req.user.login);
    } catch (e) {}
  }

  @UseGuards(Jwt2faAuthGuard)
  @VerifyDoc()
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(@Req() req, @Res() res) {
    try {
      const data = await this.authService.verify(req, res);
      res.send(data);
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(JwtAuthGuard)
  @LogoutDoc()
  @Get('logout')
  async logout(@Res() res) {
    try {
      this.authService.logout(res);
    } catch (e) {
      throw e;
    }
  }
}
