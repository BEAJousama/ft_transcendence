import { Module } from '@nestjs/common';

import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [PongController],
  providers: [PongService, PongGateway, NotificationGateway, JwtService],
  exports: [PongService],
})
export class PongModule {}
