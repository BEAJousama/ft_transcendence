import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './pong/pong.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    NotificationModule,
    AuthModule,
    PongModule,
    ChatModule,
  ],
  providers: [],
})
export class AppModule {}
