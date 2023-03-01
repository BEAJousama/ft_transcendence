import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, ChatModule, UserModule],
})
export class AppModule {}
