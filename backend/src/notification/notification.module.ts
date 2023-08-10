import { Global, Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import NotificationService from './notification.service';
import { JwtService } from '@nestjs/jwt';
@Global()
@Module({
  providers: [NotificationService, NotificationGateway, JwtService],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
