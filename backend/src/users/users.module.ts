import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import NotificationService from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';

@Global()
@Module({
  imports: [NotificationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
