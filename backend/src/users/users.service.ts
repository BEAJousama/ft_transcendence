import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddFriendsDto,
  BlockUserDto,
  UnblockUserDto,
  UpdateUserDto,
} from './dto';
import Achievements from './achievements/index.tsx';
import NotificationService from 'src/notification/notification.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {
    this.createAchievements();
  }

  private async createAchievements() {
    try {
      const achievements = await this.prisma.achievement.findMany();
      if (achievements.length === 0) {
        const keys = Object.keys(Achievements);
        keys.map(async (key, i) => {
          await this.prisma.achievement.create({
            data: {
              name: key,
              description: Achievements[key],
              image: `${key.toLocaleLowerCase()}.png`,
            },
          });
        });
      }
    } catch (error) {
      return error;
    }
  }

  async getAllAchievements() {
    try {
      const achievements = await this.prisma.achievement.findMany();
      // console.log(achievements.length);
      return achievements;
    } catch (error) {}
  }

  async assignAchievements(userId: number, achievementId: number) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          achievements: {
            connect: {
              id: achievementId,
            },
          },
        },
      });
    } catch (error) {
      // console.log(error);
      throw new NotFoundException('user or Achievement Not Found');
    }
  }

  async createUser(data: {
    login: string;
    avatar: string;
    tfaSecret: string;
    fullname: string;
    phone: string;
    email: string;
    password?: string;
  }) {
    try {
      const user = await this.prisma.user.create({
        data: {
          login: data.login,
          avatar: data.avatar,
          username: data.login,
          tfaSecret: data.tfaSecret,
          fullname: data.fullname,
          phone: data.phone,
          email: data.email,
          password: data.password,
          country: 'none',
        },
      });

      return user;
    } catch (error) {
      if (error?.code === 'P2002') {
        console.log(error.meta);
        throw new BadRequestException(
          `${error.meta?.target?.toString()} already exists`,
        );
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          sentRequests: true,
          receivedRequests: true,
          achievements: true,
        },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`user with ${id} does not exist.`);
    }
  }

  async findUserByLogin(login: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          login,
        },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`user with ${login} does not exist.`);
    }
  }

  async findAllUsers(fullname: string) {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: {
          rating: 'desc',
        },
      });
      return users;
    } catch (error) {
      throw new NotFoundException(`no users found ? `);
    }
  }

  async updateUser(body: UpdateUserDto, id: number) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data: <User>body.user,
      });
      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2016') {
          throw new NotFoundException(`User with ID ${body.user.id} not found`);
        } else if (error.code === 'P2025') {
          throw new BadRequestException('Invalid update data');
        }
      }
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id,
        },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async sendFriendRequest(body: AddFriendsDto) {
    try {
      const { senderId, receiverId } = body;
      const request = await this.prisma.friend.create({
        data: {
          senderId,
          receiverId,
        },
      });
      this.notificationService.sendNotification(
        senderId,
        receiverId,
        'Friend Request',
        '',
        receiverId,
      );
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send friend request');
    }
  }

  async acceptFriendRequest(id: number) {
    try {
      const request = await this.prisma.friend.update({
        where: {
          id: id,
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      this.notificationService.sendNotification(
        request.senderId,
        request.receiverId,
        'Friend Request Accepted',
        '',
        request.senderId,
      );
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to accept friend request');
    }
  }

  async declineFriendRequest(senderId: number) {
    try {
      const request = await this.prisma.friend.delete({
        where: {
          id: senderId,
        },
      });
      return request;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to decline friend request',
      );
    }
  }

  async cancelFriendRequest(senderId: number) {
    try {
      const request = await this.prisma.friend.delete({
        where: {
          id: senderId,
        },
      });
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to cancel friend request');
    }
  }

  async getFriendRequests(id: number) {
    try {
      const requests = await this.prisma.friend.findMany();
      return requests;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get friend requests');
    }
  }

  async getFriendRequest({ senderId, receiverId }) {
    try {
      // console.log(senderId, receiverId);
      const request = await this.prisma.friend.findMany({
        where: {
          OR: [
            {
              senderId: parseInt(senderId),
              receiverId: parseInt(receiverId),
            },
            {
              receiverId: parseInt(senderId),
              senderId: parseInt(receiverId),
            },
          ],
        },
      });
      return request[0];
    } catch (error) {
      throw new InternalServerErrorException('Failed to get friend requests');
    }
  }

  async getFriends(id: number) {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          OR: [
            {
              senderId: id,
              status: 'ACCEPTED',
            },
            {
              receiverId: id,
              status: 'ACCEPTED',
            },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
      const result = friends.map((item) => {
        if (item.senderId !== id) return item.sender;
        return item.receiver;
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get friends');
    }
  }

  async blockUser(body: BlockUserDto) {
    try {
      const { blockerId, blockingId } = body;
      const block = await this.prisma.block.create({
        data: {
          blockerId,
          blockingId,
        },
      });
      return block;
    } catch (error) {
      throw new InternalServerErrorException('Failed to block user');
    }
  }

  async unblockUser(body: UnblockUserDto) {
    try {
      const { blockerId, blockingId } = body;
      const block = await this.prisma.block.delete({
        where: {
          blockerId_blockingId: {
            blockerId,
            blockingId,
          },
        },
      });
      return block;
    } catch (error) {
      throw new InternalServerErrorException('Failed to unblock user');
    }
  }

  async getBlockedUsers(id: number) {
    try {
      const blockedUsers = await this.prisma.block.findMany({
        where: {
          blockerId: id,
        },
        include: {
          blocking: true,
        },
      });
      return blockedUsers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get blocked users');
    }
  }

  async getBlockingUsers(id: number) {
    try {
      const blockingUsers = await this.prisma.block.findMany({
        where: {
          blockingId: id,
        },
        include: {
          blocker: true,
        },
      });
      return blockingUsers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get blocking users');
    }
  }
}
