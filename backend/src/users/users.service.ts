import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';
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
import { authenticator } from 'otplib';

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
        await this.createUser({
          login: 'PongMastersAi',
          avatar: '/img/default.jpg',
          tfaSecret: 'admin',
          fullname: 'PongMastersAi',
          phone: '',
          email: 'PongMastersAi@PongMasters.pg',
        });
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

  async findOrCreateUser(data: {
    login: string;
    avatar: string;
    fullname: string;
    phone: string;
    email: string;
  }) {
    try {
      let user: User = await this.findUserByLogin(data.login);
      if (!user) {
        const secret = authenticator.generateSecret();
        user = await this.createUser({
          login: data.login,
          avatar: data.avatar,
          tfaSecret: secret,
          fullname: data.fullname,
          phone: data.phone,
          email: data.email,
        });
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getAllAchievements() {
    try {
      const achievements = await this.prisma.achievement.findMany();

      return achievements;
    } catch (error) {}
  }

  async assignAchievements(userId: number, achievementName: string) {
    try {
      const achievement = await this.prisma.achievement.findFirst({
        where: {
          name: achievementName,
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          achievements: {
            connect: {
              id: achievement.id,
            },
          },
        },
      });

      await this.notificationService.sendNotification(
        userId,
        userId,
        'Achievement Unlocked',
        `You have unlocked ${achievement.name} achievement`,
        userId,
        '/pong',
      );

      return achievement;
    } catch (error) {
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
        include: {
          blockers: true,
          blocking: true,
        },
      });
      return user;
    } catch (error) {
      throw new NotFoundException(`user with ${login} does not exist.`);
    }
  }

  async findAllUsers(username: string) {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: {
          rating: 'desc',
        },
        where: {
          NOT: {
            username: {
              contains: 'PongMaster',
            },
          },
        },
      });
      return users;
    } catch (error) {
      throw new NotFoundException(`No users found.`);
    }
  }

  async findAllNonBlockUsers(userId: number) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            not: userId,
          },
          blockers: {
            none: {
              blockingId: userId,
            },
          },
          blocking: {
            none: {
              blockerId: userId,
            },
          },
        },
        include: {
          blockers: true,
          blocking: true,
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

  // async updateStatus(status: string, id: number) {
  //   try {
  //     if (!id || !status) return;
  //     const user = await this.prisma.user.update({
  //       where: {
  //         id,
  //       },
  //       data: {
  //         status: UserStatus[status],
  //       },
  //     });
  //     return {
  //       message: 'User updated successfully',
  //     };
  //   } catch (error) {
  //     if (error instanceof PrismaClientKnownRequestError) {
  //       if (error.code === 'P2016') {
  //         throw new NotFoundException(`User with ID ${id} not found`);
  //       } else if (error.code === 'P2025') {
  //         throw new BadRequestException('Invalid update data');
  //       }
  //     }
  //     throw error;
  //   }
  // }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          status: UserStatus.OFFLINE,
          username: 'PongMasterUser' + id,
          login: 'PongMasterUser' + id,
          email: 'PongMasterUser' + id + '@pongmasters.com',
          avatar: '/img/deleteduser.png',
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
        `/profile/${senderId}`,
      );
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send friend request');
    }
  }

  async updateStatus(status: 'ONLINE' | 'INGAME' | 'OFFLINE', id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!user || !id || !status) return;
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          status: UserStatus[status],
        },
      });
      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2016') {
          throw new NotFoundException(`User with ID ${id} not found`);
        } else if (error.code === 'P2025') {
          throw new BadRequestException('Invalid update data');
        }
      }
      // throw error;
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
        '/notifications/',
      );
      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to accept friend request');
    }
  }

  async changeUserStatus(id: number, status: 'OFFLINE' | 'INGAME' | 'ONLINE') {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
      console.log(user.username + ' : ' + user.status);
    } catch (error) {
      throw new InternalServerErrorException('Failed to change user status');
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
      });
      return blockingUsers;
    } catch (error) {
      throw new InternalServerErrorException('Failed to get blocking users');
    }
  }
}
