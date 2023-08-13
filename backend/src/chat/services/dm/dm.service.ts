import { Injectable, NotFoundException } from '@nestjs/common';
import { Channel, ChannelType } from '@prisma/client';
import { DmDto } from 'src/chat/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class DmService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  async makeDm(data: DmDto): Promise<Channel | null> {
    try {
      let dm = await this.getDmByUserIds(data.senderId, data.receiverId);
      if (dm) {
        await this.prisma.channel.update({
          where: {
            id: dm.id,
          },
          data: {
            deletedFor: {
              disconnect: {
                id: data.senderId,
              },
            },
          },
        });
        return dm;
      }
      if (await this.chatService.isBlocked(data.senderId, data.receiverId))
        throw new NotFoundException('Cannot send message to this user !');
      dm = await this.prisma.channel.create({
        data: {
          name: 'Dm' + data.senderId + data.receiverId,
          avatar: '',
          owner: {
            connect: {
              id: data.senderId,
            },
          },
          type: ChannelType.CONVERSATION,
          channelMembers: {
            createMany: {
              data: [
                {
                  userId: data.senderId,
                },
                {
                  userId: data.receiverId,
                },
              ],
            },
          },
        },
      });
      if (!dm) return null;
      return dm;
    } catch (e) {
      console.log(e);
    }
  }

  async getDmsByUserId(userId: number) {
    const dms = await this.prisma.channel.findMany({
      where: {
        channelMembers: {
          some: {
            userId,
          },
        },
        type: ChannelType.CONVERSATION,
      },
      include: {
        channelMembers: true,
      },
    });
    return dms;
  }

  async getDmByUserIds(userId: number, receiverId: number) {
    const dm = await this.prisma.channel.findFirst({
      where: {
        channelMembers: {
          every: {
            userId: {
              in: [userId, receiverId],
            },
          },
        },
        type: ChannelType.CONVERSATION,
      },
    });
    if (!dm) return null;
    return dm;
  }
}
