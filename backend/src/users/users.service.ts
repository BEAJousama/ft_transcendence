import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { login: string; avatar: string; tfaSecret: string }) {
    try {
      const user = await this.prisma.user.create({
        data: {
          login: data.login,
          avatar: data.avatar,
          username: data.login,
          tfaSecret: data.tfaSecret,
        },
      });

      return user;
    } catch (error) {
      return error;
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
        },
      });
      return user;
    } catch (error) {
      return null;
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
      return error;
    }
  }

  async findAllUsers() {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (error) {
      return error;
    }
  }

  async updateUser(id: number, data: User) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data,
      });
      return user;
    } catch (error) {
      return error;
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
      return error;
    }
  }

  async sendFriendRequest(senderId: number, receiverId: number) {
    try {
      const request = await this.prisma.friend.create({
        data: {
          senderId,
          receiverId,
        },
      });
      return request;
    } catch (error) {
      return error;
    }
  }

  async acceptFriendRequest(senderId: number, receiverId: number) {
    try {
      const request = await this.prisma.friend.update({
        where: {
          id: senderId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
      return request;
    } catch (error) {
      return error;
    }
  }

  async declineFriendRequest(senderId: number, receiverId: number) {
    try {
      const request = await this.prisma.friend.delete({
        where: {
          id: senderId,
        },
      });
      return request;
    } catch (error) {
      return error;
    }
  }

  async cancelFriendRequest(senderId: number, receiverId: number) {
    try {
      const request = await this.prisma.friend.delete({
        where: {
          id: senderId,
        },
      });
      return request;
    } catch (error) {
      return error;
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
      return friends;
    } catch (error) {
      return error;
    }
  }

  async blockUser(blockerId: number, blockingId: number) {
    try {
      const block = await this.prisma.block.create({
        data: {
          blockerId,
          blockingId,
        },
      });
      return block;
    } catch (error) {
      return error;
    }
  }

  async unblockUser(blockerId: number, blockingId: number) {
    try {
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
      return error;
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
      return error;
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
      return error;
    }
  }
}
