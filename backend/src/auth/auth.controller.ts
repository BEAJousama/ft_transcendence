import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { FourtyTwoGuard, JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('42')
  async fortyTwoLogin(@Req() req) {
    return this.authService.getprofile(req.user.login ? req.user.login : '');
  }

  @UseGuards(FourtyTwoGuard)
  @Get('42/callback')
  async fortyTwoLoginCallback(@Req() req, @Res() res) {
    return this.authService.callback(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(@Req() req) {}

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-off')
  async turnOffTwoFactorAuthentication(@Req() req) {
    return this.authService.turnOffTwoFactorAuthentication(req.user.login);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(@Req() req) {
    try {
      const user = await this.authService.getprofile(req.user.login);
      const { code } = req.body;
      const isvalid = this.authService.verifyTwoFactorAuthentication(
        code,
        user,
      );
      console.log(isvalid);
      return {
        isvalid,
      };
    } catch (e) {
      return {
        message: 'error',
      };
    }
  }
}
