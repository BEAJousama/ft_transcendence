import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './pong/pong.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [PrismaModule, AuthModule, PongModule, NotificationModule, ChatModule],
})
export class AppModule {}
