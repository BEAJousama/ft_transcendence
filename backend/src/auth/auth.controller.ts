import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
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
}
