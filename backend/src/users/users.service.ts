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
          tfaSecret: data.tfaSecret,
        },
      });
      console.log(user);
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
}
