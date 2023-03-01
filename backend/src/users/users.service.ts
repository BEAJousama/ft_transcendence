import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: User) {
    try {
      const user = await this.prisma.user.create({
        data: data,
      });
    } catch (e) {
      return e;
    }
  }

  async findUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (e) {
      return e;
    }
  }

  async findUserByLogin(login: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          //   login: {},
        },
      });
    } catch (e) {
      return e;
    }
  }
}
