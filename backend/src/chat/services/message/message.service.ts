import { Injectable } from '@nestjs/common';
import { ChannelType, MemberStatus, Message } from '@prisma/client';
import { MessageDto } from 'src/chat/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  async makeMessage(data: MessageDto): Promise<Message | null> {
    try {
      const channelMember = await this.prisma.channelMember.findFirst({
        where: {
          userId: data.senderId,
          channelId: data.receiverId,
        },
      });
      if (channelMember && channelMember.status !== MemberStatus.ACTIVE)
        throw new Error('Cannot send message to this channel !');
      const ch = await this.prisma.channel.findUnique({
        where: {
          id: data.receiverId,
        },
        include: {
          channelMembers: true,
        },
      });

      if (
        ch.type === ChannelType.CONVERSATION &&
        (await this.chatService.isBlocked(
          ch.channelMembers.filter(
            (member) => member.userId != data.senderId,
          )[0].userId,
          data.senderId,
        ))
      ) {
        throw new Error('Cannot send message to this user !');
      }

      let message = await this.prisma.message.create({
        data: {
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
        },
      });
      if (!message) {
        return null;
      }
      message = await this.prisma.message.findUnique({
        where: {
          id: message.id,
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      const activeMembers = ch.channelMembers.filter(
        (member) =>
          member.status !== MemberStatus.BANNED &&
          member.status !== MemberStatus.LEFT &&
          member.userId !== data.senderId,
      );

      await Promise.all(
        activeMembers.map(async (member) => {
          await this.prisma.channel.update({
            where: {
              id: data.receiverId,
            },
            data: {
              deletedFor: {
                disconnect: {
                  id: member.userId,
                },
              },
              unreadFor: {
                connect: {
                  id: member.userId,
                },
              },
              updatedAt: message.date,
            },
          });

          if (!(await this.chatService.isBlocked(member.userId, data.senderId))) {
            await this.prisma.channelMember.update({
              where: {
                userId_channelId: {
                  userId: member.userId,
                  channelId: data.receiverId,
                },
              },
              data: {
                newMessagesCount: {
                  increment: 1,
                },
              },
            });
          }
        }),
      );
      return message;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async resetMessageCount(userId, channelId) {
    const channelMember = await this.prisma.channelMember.findFirst({
      where: {
        userId,
        channelId,
      },
    });
    if (!channelMember) throw new Error('Cannot reset message count !');
    await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
      data: {
        newMessagesCount: 0,
      },
    });
    await this.prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        unreadFor: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    return { message: 'message count reset !' };
  }

  async deleteMessage(userId, messageId) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) throw new Error('Cannot delete message !');
    await this.prisma.message.delete({
      where: {
        id: messageId,
      },
    });
    return { message: 'message deleted !' };
  }

  async getMessagesByChannelIdOnly(channelId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        receiverId: channelId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    return messages;
  }

  async getMessagesByChannelId(
    channelId: number,
    userId: number,
    options?: { take?: number; before?: string },
  ): Promise<Message[]> {
    await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    const channelmember = await this.prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
      },
    });
    if (
      !channelmember ||
      channelmember.status === MemberStatus.BANNED ||
      channelmember.status === MemberStatus.LEFT
    ) {
      const messages: Message[] = [];
      return messages;
    }

    const limit = Math.min(Math.max(options?.take ?? 80, 1), 200);
    const messages = await this.prisma.message.findMany({
      where: {
        receiverId: channelId,
        ...(options?.before
          ? {
              date: {
                lt: new Date(options.before),
              },
            }
          : {}),
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    const blockedIds = new Set(await this.chatService.getBlockedUserIds(userId));
    const filteredMessages = messages
      .filter((message) => !blockedIds.has(message.senderId))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return filteredMessages;
  }
}
