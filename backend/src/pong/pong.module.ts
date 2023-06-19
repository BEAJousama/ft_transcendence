import { Module } from '@nestjs/common';

import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';

@Module({
  // imports: [PrismaModule],
  //   controllers: [PongController],
  providers: [PongService, PongGateway],
  exports: [PongService],
})
export class PongModule {}
