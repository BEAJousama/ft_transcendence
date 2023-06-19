import NotificationService from './notification.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get(':id')
  async getNotification(@Param('id') id: string) {
    try {
      const notifications = await this.notificationService.getAllNotifications(
        parseInt(id),
      );
      return notifications;
    } catch (error) {
      throw error;
    }
  }
}
