import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { Notification } from '@prisma/client';

@Injectable()
export default class NotificationService {
  constructor(
    private prisma: PrismaService,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(
    senderId: number,
    receiverId: number,
    title: string,
    content: string,
    url: string,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          title: title,
          content: content,
          url: url,
          sender: { connect: { id: senderId } }, // Replace "senderId" with the actual ID of the sender
          receiver: { connect: { id: receiverId } }, // Replace "receiverId" with the actual ID of the receiver
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      return notification;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to create notification.');
    }
  }

  /*
   * Send notification to a specific user
   * @param senderId: number
   * @param receiverId: number
   * @param title: string
   * @param content: string
   * @param ID: number
   * @param url: string
   * @return void
   */
  async sendNotification(
    senderId: number,
    receiverId: number,
    title: string,
    content: string,
    ID: number,
    url: string,
  ) {
    try {
      const payload = await this.createNotification(
        senderId,
        receiverId,
        title,
        content,
        url,
      );
      const id = this.notificationGateway.clients_map.get(ID.toString());
      this.notificationGateway.server.to(id).emit('notification', payload);
    } catch (error) {}
  }

  async deleteNotification(notificationId) {
    try {
      const notification = await this.prisma.notification.delete({
        where: { id: notificationId },
      });

      return notification;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to delete notification.');
    }
  }

  async setNotificationSeen(notificationId, title, content) {
    try {
      const notification = await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          seen: true,
        },
      });

      return notification;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to update notification.');
    }
  }

  async getNotification(notificationId) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      return notification;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to get notification.');
    }
  }

  async getAllNotifications(id: number) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { OR: [{ senderId: id }, { receiverId: id }] },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: true,
          receiver: true,
        },
      });

      return notifications;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to get notifications.');
    }
  }

  async getNotificationCount() {
    try {
      const notifications = await this.prisma.notification.count();

      return notifications;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to get notifications.');
    }
  }

  async getNotificationsBySender(senderId) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { senderId: senderId },
      });

      return notifications;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to get notifications.');
    }
  }

  async getNotificationsByReceiver(receiverId) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { receiverId: receiverId },
      });

      return notifications;
    } catch (error) {
      // Handle the error
      console.error(error);
      throw new Error('Failed to get notifications.');
    }
  }
}
