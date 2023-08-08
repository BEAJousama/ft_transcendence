import { PongService } from './pong.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('pong')
export class PongController {
  constructor(private pongService: PongService) {}

  @Get('match-history/:id')
  async getMatchHistory(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.pongService.getMatchHistory(id);
    } catch (error) {
      throw error;
    }
  }
}
