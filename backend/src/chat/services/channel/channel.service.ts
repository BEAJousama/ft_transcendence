import { Injectable } from '@nestjs/common';
import {
  Channel,
  ChannelMember,
  ChannelType,
  MemberStatus,
  Role,
  Visiblity,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ChannelDto } from 'src/chat/dto';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  async getChannelsByUserId(userId: number): Promise<any[]> {
    try {
      const channels = await this.prisma.channel.findMany({
        where: {
          channelMembers: {
            some: {
              userId,
            },
          },
          archivedFor: {
            none: {
              id: userId,
            },
          },
          deletedFor: {
            none: {
              id: {
                equals: userId,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          avatar: true,
          userId: true,
          visiblity: true,
          createAt: true,
          updatedAt: true,
          archivedFor: true,
          mutedFor: true,
          unreadFor: true,
          pinnedFor: true,
          deletedFor: true,
          bannedUsers: true,
          kickedUsers: true,
          channelMembers: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatar: true,
                  status: true,
                },
              },
              newMessagesCount: true,
              status: true,
              role: true,
              banDuration: true,
              banStartTime: true,
              userId: true,
              channelId: true,
            },
          },
          messages: {
            where: {
              NOT: {
                senderId: {
                  in: await this.chatService.getBlockedUserIds(userId),
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
            take: 1,
          },
          isacessPassword: true,
        },
      });

      channels.forEach((channel) => {
        if (
          channel.userId != userId &&
          channel.type === ChannelType.CONVERSATION &&
          channel.updatedAt.toString() === channel.createAt.toString()
        ) {
          channels.splice(channels.indexOf(channel), 1);
        }
      });
      // sort channels by updatedAt
      channels.sort((a, b) => {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      return channels;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllChannels(userId: number): Promise<any[]> {
    try {
      const channels = await this.prisma.channel.findMany({
        where: {
          bannedUsers: {
            none: {
              id: userId,
            },
          },
          type: ChannelType.GROUP,
          visiblity: {
            not: Visiblity.PRIVATE,
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          avatar: true,
          userId: true,
          visiblity: true,
          createAt: true,
          updatedAt: true,
          isacessPassword: true,
          archivedFor: true,
          mutedFor: true,
          unreadFor: true,
          pinnedFor: true,
          deletedFor: true,
          bannedUsers: true,
          kickedUsers: true,
          channelMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatar: true,
                  status: true,
                },
              },
            },
          },
          messages: true,
        },
      });

      return channels;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getArchivedChannelsByUserId(userId: number): Promise<any[]> {
    try {
      const channels = await this.prisma.channel.findMany({
        where: {
          channelMembers: {
            some: {
              userId,
            },
          },
          archivedFor: {
            some: {
              id: userId,
            },
          },
          deletedFor: {
            none: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          avatar: true,
          userId: true,
          visiblity: true,
          createAt: true,
          updatedAt: true,
          archivedFor: true,
          mutedFor: true,
          unreadFor: true,
          pinnedFor: true,
          deletedFor: true,
          bannedUsers: true,
          kickedUsers: true,
          channelMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatar: true,
                  status: true,
                },
              },
            },
          },
          messages: {
            where: {
              NOT: {
                senderId: {
                  in: await this.chatService.getBlockedUserIds(userId),
                },
              },
            },
          },
          isacessPassword: true,
        },
      });
      // sort channels by updatedAt
      channels.sort((a, b) => {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      return channels;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getChannelMembersByChannelId(
    channelId: number,
  ): Promise<ChannelMember[]> {
    const members = await this.prisma.channelMember.findMany({
      where: {
        channelId,
      },
    });
    return members;
  }

  async getChannelById(channelId: number): Promise<any | null> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        avatar: true,
        userId: true,
        visiblity: true,
        createAt: true,
        updatedAt: true,
        archivedFor: true,
        mutedFor: true,
        unreadFor: true,
        pinnedFor: true,
        deletedFor: true,
        bannedUsers: true,
        kickedUsers: true,
        channelMembers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: true,
        isacessPassword: true,
      },
    });
    return channel;
  }

  async getChannelByIdWithPass(channelId: number): Promise<any | null> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        id: true,
        password: true,
        accessPassword: true,
        visiblity: true,
      },
    });
    return channel;
  }

  async getChannelMemberByUserIdAndChannelId(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember | null> {
    const channelMember = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
    return channelMember;
  }

  async makeChannel(userId: number, channelData: ChannelDto): Promise<Channel> {
    // Check if another channel exists with the same name
    let hashPassword: string;
    let accesspass: string;
    let isaccesspass = false;
    try {
      const ch = await this.getChannelByName(channelData.name);
      if (ch) throw new Error(`Channel ${ch.name} already exists`);
      if (
        channelData.visibility === Visiblity.PROTECTED &&
        !channelData.password
      )
        throw new Error('Password is required for protected channel');
      if (
        channelData.visibility === Visiblity.PROTECTED &&
        channelData.password
      )
        hashPassword = await this.hashPassword(channelData.password);
      if (channelData.access_pass) {
        isaccesspass = true;
        accesspass = await this.hashPassword(channelData.access_pass);
      }
      const channelMembers = channelData.members.map((memberId: number) => {
        // if (!this.chatService.isBlocked(userId, memberId))
        // {
        return {
          userId: memberId,
        };
        // }
      });
      channelMembers.push({ userId });
      const channel = await this.prisma.channel.create({
        data: {
          name: channelData.name,
          password: hashPassword,
          accessPassword: accesspass,
          isacessPassword: isaccesspass,
          avatar: channelData.avatar,
          visiblity: Visiblity[channelData.visibility],
          type: ChannelType[ChannelType.GROUP],
          owner: {
            connect: {
              id: userId,
            },
          },
          channelMembers: {
            createMany: {
              data: channelMembers,
            },
          },
          //set the creator user as owner in channelMembers role
        },
      });
      await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId: channel.id,
          },
        },
        data: {
          role: Role.OWNER,
        },
      });
      return channel;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(
    userId: number,
    channelId: number,
    password: string,
  ): Promise<Channel> {
    try {
      const ch = await this.getChannelById(channelId);
      if (!ch) throw new Error(`Channel not found`);
      const channelMember = await this.getChannelMemberByUserIdAndChannelId(
        userId,
        channelId,
      );
      if (
        channelMember.role !== Role.OWNER &&
        channelMember.role !== Role.ADMIN
      )
        throw new Error(`Only owners and admins can update channel password`);
      if (ch.visiblity !== Visiblity.PROTECTED)
        throw new Error(`Channel is not protected`);
      const hashPassword = await this.hashPassword(password);
      const channel = await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          password: hashPassword,
        },
      });
      return channel;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateChannel(
    userId: number,
    channelData: ChannelDto,
  ): Promise<Channel> {
    let hashPassword;
    try {
      const channelMember = await this.getChannelMemberByUserIdAndChannelId(
        userId,
        channelData.id,
      );
      if (!channelMember || channelMember.role === Role.MEMEBER)
        throw new Error('You are not allowed to update the channel !');
      const channel = await this.getChannelById(channelData.id);
      if (channelData.type === 'name') {
        const ch = await this.getChannelByName(channelData.name);
        const chbyid = await this.getChannelById(channelData.id);
        if (chbyid.name === channelData.name) return chbyid;
        if (ch) throw new Error(`Channel ${ch.name} already exists`);
        await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data: {
            name: channelData.name,
          },
        });
        return channel;
      }
      if (channelData.type === 'avatar') {
        let channel = await this.getChannelById(channelData.id);
        if (channelData.avatar === '') throw new Error('Avatar is required');
        if (channel.avatar === channelData.avatar)
          throw new Error('Avatar is already set !');
        channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data: {
            avatar: channelData.avatar,
          },
        });
        return channel;
      }
      if (channelData.type === 'visibility') {
        const ch = await this.getChannelById(channelData.id);
        if (ch.visiblity === Visiblity[channelData.visibility])
          throw new Error('Please select another visibility option!');
        if (
          ch.visiblity !== Visiblity.PROTECTED &&
          channelData.visibility === Visiblity.PROTECTED &&
          (!channelData.password || channelData.password === '')
        )
          throw new Error('Password is required for protected channel !');
        else if (
          channelData.visibility === Visiblity.PROTECTED &&
          channelData.password
        ) {
          hashPassword = await this.hashPassword(channelData.password);
          const channel = await this.prisma.channel.update({
            where: {
              id: channelData.id,
            },
            data: {
              visiblity: Visiblity[channelData.visibility],
              password: hashPassword,
            },
          });
          return channel;
        } else if (
          ch.visiblity === Visiblity.PROTECTED &&
          channelData.visibility === Visiblity.PROTECTED &&
          (!channelData.password || channelData.password === '')
        ) {
          const channel = await this.prisma.channel.update({
            where: {
              id: channelData.id,
            },
            data: {
              visiblity: Visiblity[channelData.visibility],
            },
          });
          return channel;
        }
        const channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data: {
            visiblity: Visiblity[channelData.visibility],
            password: null,
          },
        });
        return channel;
      }
      if (channelData.type === 'members') {
        const channel = await this.getChannelById(channelData.id);
        if (channelData.members.length === 0)
          throw new Error('Please select members to add !');
        const members = channelData.members;
        if (channelData.members) {
          const newMembers = [];
          for (let i = 0; i < members.length; i++) {
            const memberId = members[i];
            const channelMember =
              await this.getChannelMemberByUserIdAndChannelId(
                memberId,
                channelData.id,
              );
            if (channelMember && channelMember.status === MemberStatus.LEFT) {
              await this.prisma.channelMember.update({
                where: {
                  userId_channelId: {
                    userId: memberId,
                    channelId: channelData.id,
                  },
                },
                data: {
                  status: MemberStatus.ACTIVE,
                },
              });

              await this.prisma.channel.update({
                where: {
                  id: channelData.id,
                },
                data: {
                  kickedUsers: {
                    disconnect: {
                      id: memberId,
                    },
                  },
                  deletedFor: {
                    disconnect: {
                      id: memberId,
                    },
                  },
                  updatedAt: new Date(),
                },
              });
            } else {
              newMembers.push(memberId);
            }
          }
          if (newMembers.length) {
            const channelMembers = newMembers.map((member) => {
              return { user: { connect: { id: member } } };
            });
            await this.prisma.channel.update({
              where: {
                id: channelData.id,
              },
              data: {
                channelMembers: {
                  create: channelMembers,
                },
              },
            });
          }
        }
        return channel;
      }

      if (channelData.type === 'access_pass') {
        if (!channelData.access_pass || channelData.access_pass === '')
          throw new Error('Please Enter a valid password !');
        hashPassword = await this.hashPassword(channelData.access_pass);
        const channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data: {
            accessPassword: hashPassword,
            isacessPassword: true,
          },
        });
        return channel;
      }
      if (channelData.type === 'rm_access_pass') {
        const channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data: {
            accessPassword: null,
            isacessPassword: false,
          },
        });
        return channel;
      }
      return channel;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteChannel(channelId: number, userId): Promise<number> {
    try {
      const updated = await this.prisma.channel.update({
        where: { id: channelId },
        data: {
          deletedFor: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return updated.id;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeChannel(userId: number, channelId: number): Promise<number> {
    try {
      const chanelMember = await this.getChannelMemberByUserIdAndChannelId(
        userId,
        channelId,
      );
      if (chanelMember.role !== Role.OWNER)
        throw new Error(`Only the owner can remove this channel`);
      await this.prisma.channelMember.deleteMany({
        where: {
          channelId,
        },
      });
      await this.prisma.message.deleteMany({
        where: {
          receiverId: channelId,
        },
      });
      const updated = await this.prisma.channel.delete({
        where: { id: channelId },
      });
      return updated.id;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async kickUser(
    ownerId: number,
    userId: number,
    channelId: number,
  ): Promise<number> {
    try {
      let updated;
      const chMem = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId: ownerId,
            channelId,
          },
        },
      });
      if (chMem.role !== Role.OWNER && chMem.role !== Role.ADMIN) {
        throw new Error('You are not authorized to kick a user');
      } else {
        updated = await this.prisma.channelMember.update({
          where: {
            userId_channelId: {
              userId,
              channelId,
            },
          },
          data: {
            status: MemberStatus.LEFT,
            role: Role.MEMEBER,
          },
        });
      }
      // add userId to bannedFor
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          kickedUsers: {
            connect: {
              id: userId,
            },
          },
          deletedFor: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return updated.count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getChannelByName(name: string): Promise<Channel> {
    try {
      const channel = await this.prisma.channel.findFirst({
        where: { name },
        include: {
          channelMembers: true,
        },
      });
      return channel;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      const passwordHash = await bcrypt
        .hash(password.trim(), 5)
        .then((hash) => {
          return hash;
        });
      return passwordHash;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async JoinChannel(
    userId: number,
    channelId: number,
    password?: string,
  ): Promise<ChannelMember> {
    try {
      let channeluser: ChannelMember = null;
      const channel = await this.getChannelById(channelId);
      if (!channel) throw new Error('channel does not exist');
      if (channel.type === ChannelType.CONVERSATION)
        throw new Error('Cannot join a conversation');
      if (channel.visiblity === Visiblity.PRIVATE)
        throw new Error('Cannot join a private channel');
      channeluser = password
        ? await this.addUserTochannel(userId, channelId, password)
        : await this.addUserTochannel(userId, channelId);
      return channeluser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addUserTochannel(
    userId: number,
    channelId: number,
    password?: string,
  ): Promise<ChannelMember> {
    let isCorrect = false;
    const channel = await this.getChannelByIdWithPass(channelId);
    if (!channel) throw new Error('Channel does not exist');
    if (password) {
      isCorrect = await this.verifyPassword(password, channel.password);
    }
    if (channel.visiblity === Visiblity.PROTECTED && !isCorrect) {
      throw new Error('Incorrect Channel password');
    }
    const exists: ChannelMember =
      await this.getchannelMemberByUserIdAndChannelId(userId, channelId);
    if (exists && exists.status === MemberStatus.LEFT) {
      const channelMember = await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId: userId,
            channelId: channelId,
          },
        },
        data: {
          status: MemberStatus.ACTIVE,
          role: Role.MEMEBER,
        },
      });
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          deletedFor: {
            disconnect: {
              id: userId,
            },
          },
          kickedUsers: {
            disconnect: {
              id: userId,
            },
          },
          updatedAt: new Date(),
        },
      });
      return channelMember;
    }

    const channelMember = await this.prisma.channelMember.create({
      data: {
        role: Role.MEMEBER,
        channelId,
        userId,
      },
    });

    return channelMember;
  }

  async checkAccessPass(channelId: number, password: string): Promise<boolean> {
    try {
      const channel = await this.getChannelByIdWithPass(channelId);

      if (!channel) throw new Error('Channel does not exist');
      const isCorrect = await this.verifyPassword(
        password,
        channel.accessPassword,
      );
      return isCorrect;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async leaveChannel(userId: number, channelId: number): Promise<number> {
    try {
      const channelMember = await this.getchannelMemberByUserIdAndChannelId(
        userId,
        channelId,
      );
      if (!channelMember || channelMember.status === MemberStatus.BANNED)
        throw new Error('You are not a member of this channel');
      const ru = await this.prisma.channelMember.updateMany({
        where: {
          userId,
          channelId,
        },
        data: {
          status: MemberStatus.LEFT,
          role: Role.MEMEBER,
        },
      });
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          kickedUsers: {
            connect: {
              id: userId,
            },
          },
          deletedFor: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return ru.count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async checkMute(userId: number, channelId: number): Promise<boolean> {
    const chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
    if (
      chMem.banDuration &&
      chMem.banDuration <
        new Date().getTime() / 1000 - chMem.banStartTime.getTime() / 1000 &&
      chMem.status === MemberStatus.MUTED
    ) {
      await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
        data: {
          status: MemberStatus.ACTIVE,
        },
      });
      return false;
    }
    return chMem.status === MemberStatus.MUTED;
  }

  async setAsAdmin(
    ownerId: number,
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const owner = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: ownerId,
          channelId,
        },
      },
    });
    const chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
    const newRole: Role = chMem.role === Role.ADMIN ? Role.MEMEBER : Role.ADMIN;
    if (owner.role !== Role.OWNER) {
      throw new Error(
        'Cannot set user as admin : You are not Owner of the channel',
      );
    }
    await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
      data: {
        role: newRole,
      },
    });
    return chMem;
  }

  async setAsOwner(
    ownerId: number,
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const owner = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: ownerId,
          channelId,
        },
      },
    });
    const chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
    const newRole: Role = chMem.role === Role.OWNER ? Role.MEMEBER : Role.OWNER;
    if (owner.role !== Role.OWNER) {
      throw new Error(
        'Cannot set user as owner : You are not Owner of the channel',
      );
    }
    await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
      data: {
        role: newRole,
      },
    });
    return chMem;
  }

  async pinChannel(userId: number, channelId: number): Promise<ChannelMember> {
    await this.prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        pinnedFor: {
          connect: {
            id: userId,
          },
        },
      },
    });

    try {
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async unpinChannel(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    await this.prisma.channel.update({
      where: {
        id: channelId,
      },
      //delete the uderId from pinnedFor
      data: {
        pinnedFor: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    try {
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async archiveChannel(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    await this.prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        archivedFor: {
          connect: {
            id: userId,
          },
        },
      },
    });

    try {
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async unarchiveChannel(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    try {
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          archivedFor: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async markUnread(userId: number, channelId: number): Promise<ChannelMember> {
    try {
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          unreadFor: {
            connect: {
              id: userId,
            },
          },
        },
      });
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async markRead(userId: number, channelId: number): Promise<ChannelMember> {
    try {
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async muteChannel(userId: number, channelId: number): Promise<ChannelMember> {
    try {
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          mutedFor: {
            connect: {
              id: userId,
            },
          },
        },
      });
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async unmuteChannel(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    await this.prisma.channel.update({
      where: {
        id: channelId,
      },
      //delete the uderId from pinnedFor
      data: {
        mutedFor: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    try {
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async muteUser(
    ownerId: number,
    userId: number,
    channelId: number,
    banDuration: number,
  ): Promise<number> {
    let updated;
    const chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: ownerId,
          channelId,
        },
      },
    });
    if (chMem.role !== Role.OWNER && chMem.role !== Role.ADMIN) {
      throw new Error('You are not authorized to mute a user');
    } else {
      updated = await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
        data: {
          status: MemberStatus.MUTED,
          banDuration: banDuration,
          banStartTime: new Date(),
        },
      });
    }
    return updated.count;
  }

  async unmuteUser(
    ownerId: number,
    userId: number,
    channelId: number,
  ): Promise<number> {
    let updated;
    const chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: ownerId,
          channelId,
        },
      },
    });
    if (chMem.role !== Role.OWNER && chMem.role !== Role.ADMIN) {
      throw new Error('You are not authorized to mute a user');
    } else {
      updated = await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
        data: {
          status: MemberStatus.ACTIVE,
          banDuration: 0,
          banStartTime: null,
        },
      });
    }
    return updated.count;
  }

  async banUser(
    ownerId: number,
    userId: number,
    channelId: number,
  ): Promise<number> {
    try {
      let updated;
      const chMem = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId: ownerId,
            channelId,
          },
        },
      });
      if (chMem.role !== Role.OWNER && chMem.role !== Role.ADMIN) {
        throw new Error('You are not authorized to ban a user');
      } else {
        updated = await this.prisma.channelMember.update({
          where: {
            userId_channelId: {
              userId,
              channelId,
            },
          },
          data: {
            status: MemberStatus.BANNED,
          },
        });
      }
      // add userId to bannedFor
      await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          bannedUsers: {
            connect: {
              id: userId,
            },
          },
          deletedFor: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return updated.count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async unbanUser(
    ownerId: number,
    userId: number,
    channelId: number,
  ): Promise<number> {
    let updated;
    const chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: ownerId,
          channelId,
        },
      },
    });
    if (chMem.role !== Role.OWNER && chMem.role !== Role.ADMIN) {
      throw new Error('You are not authorized to ban a user');
    } else {
      updated = await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
        data: {
          status: MemberStatus.LEFT,
          role: Role.MEMEBER,
        },
      });
    }
    await this.prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        bannedUsers: {
          disconnect: {
            id: userId,
          },
        },
        // deletedFor: {
        //   disconnect: {
        //     id: userId,
        //   },
        // },
      },
    });
    return updated.count;
  }

  async getProtectedChannels(): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: {
        visiblity: Visiblity.PROTECTED,
      },
    });
    return channels;
  }

  async getchannelMemberByUserIdAndChannelId(
    userId: number,
    channelId: number,
  ): Promise<ChannelMember> {
    const channelMember = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
    if (!channelMember) return null;
    return channelMember;
  }
}
