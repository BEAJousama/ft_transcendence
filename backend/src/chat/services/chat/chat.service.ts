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
    let isblocking: boolean;
    let isblocked: boolean;

    for (let i = 0; i < blocking.length; i++) {
      if (blocking[i].blockerId == id2) {
        isblocking = true;
        break;
      }
    }
    for (let i = 0; i < blocked.length; i++) {
      if (blocked[i].blockingId == id2) {
        isblocked = true;
        break;
      }
    }
    return isblocked || isblocking;
  }

  async getBlockedUserIds(id1: number): Promise<any[]> {
    const blocked = await this.userService.getBlockedUsers(id1);
    const blocking = await this.userService.getBlockingUsers(id1);
    const blocks = blocked
      .map((b) => b.blockingId)
      .concat(blocking.map((b) => b.blockerId));
    return blocks;
  }
}
