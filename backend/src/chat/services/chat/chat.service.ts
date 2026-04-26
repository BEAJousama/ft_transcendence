import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}
  async isBlocked(id1: number, id2: number): Promise<boolean> {
    const blockRelation = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: id1, blockingId: id2 },
          { blockerId: id2, blockingId: id1 },
        ],
      },
      select: {
        blockerId: true,
      },
    });
    return !!blockRelation;
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
