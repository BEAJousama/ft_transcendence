import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { PipelinePromise } from 'stream';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}
  async isBlocked(id1: number, id2: number): Promise<boolean> {
    const blocked = await this.userService.getBlockedUsers(id1);
    const blocking = await this.userService.getBlockingUsers(id1);

    blocked.forEach((b) => {
      if (b.blockingId == id2) return true;
    });
    blocking.forEach((b) => {
      if (b.blockerId == id2) return true;
    });
    return false;
  }
}
