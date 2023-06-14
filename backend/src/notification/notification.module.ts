import { Global, Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import NotificationService from './notification.service';

@Module({
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
