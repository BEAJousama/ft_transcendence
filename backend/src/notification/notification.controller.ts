import NotificationService from './notification.service';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get(':id')
  async getNotification(@Param('id') id: string) {
    try {
      const parsedId = parseInt(id);

      if (isNaN(parsedId) || parsedId < 0) {
        throw new BadRequestException(
          'Invalid ID. Please provide a positive integer.',
        );
      }

      const notifications = await this.notificationService.getAllNotifications(
        parsedId,
      );
      return notifications;
    } catch (error) {
      throw error;
    }
  }
}
