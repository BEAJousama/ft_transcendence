import { Injectable } from '@nestjs/common';
import { Channel, ChannelMember, ChannelType, MemberStatus, Role, User, Visiblity } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { use } from 'passport';
import { ChannelDto } from 'src/chat/dto';
import { channelmembersI } from 'src/chat/models';
import { channel } from 'diagnostics_channel';

@Injectable()

export class ChannelService {
  constructor(private prisma: PrismaService) {}


    async getChannelsByUserId(userId: number): Promise<Channel[]> {
        try {
        const channels = await this.prisma.channel.findMany({

          //check for userId and channelMembers
          where: {
            userId,
            channelMembers: {
              some: {
                userId,
              },
            },
          },
            include:
            {
                channelMembers:
                {
                  include: {
                    user: true,
                  },
                },
                messages: true,
            },
        });
        return channels;
      }
      catch (error) {
          throw new Error(error.message);
      }
    }

    async getChannelMembersByChannelId(
    channelId: number,
    ): Promise<ChannelMember[]> {
    // TODO: check if member is not banned or left the channel already

    const members = await this.prisma.channelMember.findMany({
        where: {
        channelId,
        },
    });
      return members;
    }

    async getChannelById(channelId: number): Promise<Channel | null> {
        const channel = await this.prisma.channel.findUnique({
            where: { 
              id: channelId
            },
              include: {
                channelMembers: 
                {
                  include: {
                    user: true,
                  },
                },
                messages: true,
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
    let hashPassword;
      try {
          const ch = await this.getChannelByName(channelData.name);
          if (ch)
              throw new Error(`Channel ${ch.name} already exists`);
          if (channelData.visibility === Visiblity.PROTECTED)
          {
              hashPassword = await this.hashPassword(channelData.password);
          }

          const channelMembers = channelData.members.map((memberId: number) => {
              return {
                  userId: memberId,
              };
          });
  
          const channel = await this.prisma.channel.create({
              data:
              {
                  name: channelData.name,
                  password: hashPassword,
                  avatar: channelData.avatar,
                  visiblity: Visiblity[channelData.visibility],
                  owner: {
                      connect: {
                          id: userId,
                      },
                    },
                  channelMembers: { 
                      createMany: {
                          data: channelMembers,
                    }
                  },
                  //set the creator user as owner in channelMembers role

                
  
              },
          });
          return channel;
          
        } 
        catch (error) {
            throw new Error(error.message);
        }
    }
        

    async updateChannel(
    channelId: number,
    channelData: {
        name?: string;
        description?: string;
    },
    ): Promise<Channel> {
        const channel = await this.prisma.channel.update({
            where: { id: channelId },
            data: channelData,
        });

        return channel;
    }

    async deleteChannel(channelId: number, userId): Promise<number> {

       let deleted =  await this.prisma.channel.deleteMany({
            where: { id: channelId,
            channelMembers: {
                some: {
                    userId: userId,
                    role: Role.OWNER,
                }
              }
            }
            });
        if (deleted.count === 0)
            throw new Error('You are not the owner of the channel');
        return deleted.count;
    }


    async removeMemberFromChannel(
    adminId: number,
    channelId: number,
    userId: number,
    ): Promise<void> {

        let deleted = await this.prisma.channelMember.deleteMany({
            where: { channelId, userId,
            channel: {
                channelMembers: {
                    some: {
                        userId: adminId,
                        role: Role.OWNER,
                    }
                }
            }
             },
        });
        if (deleted.count === 0)  
            throw new Error('You are not the owner of the channel');
    }

    async getChannelByName(name: string): Promise<Channel>
    {
      try {
        let channel = await this.prisma.channel.findFirst(
        {
            where: { name },
        }
        );
        return channel;
      } catch (error) {
          throw new Error(error.message);
      }
    }

    private async hashPassword(password: string): Promise<string> {
        const passwordHash = await bcrypt.hash(password, 20);
        return passwordHash;
    }

    private async verifyPassword(
    password: string,
    hash: string,
    ): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    async findChannelsByName(userId:number, name: string): Promise<Channel[]>
    {
        const channels = await this.prisma.channel.findMany({
            where: {
            name: {
                contains: name,
            },
            NOT: {
                visiblity: Visiblity.PRIVATE,
                channelMembers: {
                some: {
                    userId: userId,
                },
                },
            },
            },
        });
        return channels;

    }
    async JoinChannel(
        userId: number,
        channelId: number,
        password ?: string,
      ): Promise<ChannelMember> 
      {
            const channel = await this.getChannelById(channelId);
            if (!channel) throw new Error('channel does not exist');
            if (channel.type === ChannelType.CONVERSATION) throw new Error('Cannot join a conversation');
            if (channel.visiblity === Visiblity.PRIVATE)
            throw new Error('Cannot join a private channel');
            // const chaneluser = await this.addUserTochannel(userId, channelId, password);
            return null;
      }
    
      async addUserTochannel(        
        userId: number,
        channelId: number,
        role: string,
        password?: string,)
    {
        const channel = await this.getChannelById(channelId);
        if (!channel) 
          throw new Error('Channel does not exist');
        if (channel.visiblity === Visiblity.PROTECTED &&
        !(await this.verifyPassword(password, channel.password))
        )
          throw new Error('Incorrect Channel password');

        const exists: ChannelMember = await this.getchannelMemberByUserIdAndChannelId(
        userId,
        channelId,
        );

        if (exists) {
            const channelMember = await this.prisma.channelMember.update({
                where: { 
                    userId_channelId: {
                        userId: userId,
                        channelId: channelId,
                    },
                },
                data: {
                role: Role[role],
                },
            });
            return channelMember;
        }

        const channelMember = await this.prisma.channelMember.create({
        data: {
            role: Role[role],
            channelId,
            userId,
        },
        });

        return channelMember;
    }

    async leaveChannel(userId: number, channelId: number): Promise<number> {
      try {
       let ru =  await this.prisma.channelMember.deleteMany({
            where: {
            userId,
            channelId,
            },
        });
        return ru.count;
      }
      catch (error) {
          throw new Error(error.message);
      }
      }


    async removeUserFromChannel(
        userId: number,
        channelId: number,
        ): Promise<void> {
        await this.prisma.channelMember.deleteMany({
            where: {
            userId,
            channelId,
            },
        });
    }


    async BanUserFromChannel(
        userId: number,
        channelId: number,
        banDuration: number,
        ): Promise<void> {
        await this.prisma.channelMember.update({
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

    async getBannedUsers(channelId: number): Promise<ChannelMember[]> {
        const channelMembers = await this.prisma.channelMember.findMany({
          where: {
            channelId,
            status: MemberStatus.BANNED,
          },
        });
        return channelMembers;
    }

    async muteUserFromChannel(
        userId: number,
        channelId: number,
        muteDuration: number,
        ): Promise<void> {
        await this.prisma.channelMember.update({
          where: {
            userId_channelId: {
              userId,
              channelId,
            },
          },
            data: {
              status: MemberStatus.MUTED,
          },
        });
    }

    async getMutedUsers(channelId: number): Promise<ChannelMember[]> {
        const channelMembers = await this.prisma.channelMember.findMany({
          where: {
            channelId,
            status: MemberStatus.MUTED,
          },
        });
        return channelMembers;
    }

    async updateChannelMember(
        userId: number,
        channelId: number,
        role: string,
        ): Promise<ChannelMember> {
        const channelMember = await this.prisma.channelMember.update({
            where: {
            userId_channelId: {
                userId,
                channelId,
            },
            },
            data: {
            role: Role[role],
            },
        });
        return channelMember;
    }

    async setAsAdmin(
      ownerId: number,
      channelId: number,
      userId: number,
        ): Promise<ChannelMember> {
        let channelMember = await this.prisma.channelMember.updateMany({
            where: {
              userId,
              channelId,
              channel: 
              {
                // userId: ownerId,
                channelMembers: {
                  some: {
                    userId: ownerId,
                    // role: Role.OWNER || Role.ADMIN,
                  },
                },
              }
            },
            data: {
              role: Role.ADMIN,
            },
        });

        if (channelMember.count == 0)
        {
          throw new Error('Cannot set user as admin : You are not Admin or Owner of the channel');
        }

        let member = await this.prisma.channelMember.findFirst({
          where: {
              userId,
              channelId,
          },
        });
        return member;
    }

    async setAsOwner(
      ownerId: number,
      channelId: number,
      userId: number,
        ): Promise<ChannelMember> {
          let channelMember = await this.prisma.channelMember.updateMany({
            where: {
              userId,
              channelId,
              channel: 
              {
                channelMembers: {
                  some: {
                    userId: ownerId,
                    role: Role.OWNER || Role.ADMIN,
                  },
                },
              }
            },
            data: {
            role: Role.OWNER,
            },
        });

        if (channelMember.count == 0)
        {
          throw new Error('Cannot set user as admin : You are not Admin or Owner of the channel');
        }

        let member = await this.prisma.channelMember.findFirst({
          where: {
              userId,
              channelId,
          },
        });
        return member;
    }

    async pinChannel(
        userId: number,
        channelId: number,

        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              // isPinned: true,
            },
        });
        return channel;
    }

    async unpinChannel(
        channelId: number,
        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              // isPinned: false,
            },
        });
        return channel;
    }

    async muteChannel(
        channelId: number,
        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              // isMuted: true,
            },
        });
        return channel;
    }

    async unmuteChannel(
        channelId: number,
        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              // isMuted: false,
            },
        });

        return channel;
    }

    async makePublic(
        channelId: number,
        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              visiblity: Visiblity.PUBLIC,
            },
        });
        return channel;
    }

    async makePrivate(
        channelId: number,
        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              visiblity: Visiblity.PRIVATE,
            },
        });
        return channel;
    }

    async makeProtected(
        channelId: number,
        ): Promise<Channel> 
        {
        const channel = await this.prisma.channel.update({
            where: {
            id: channelId,
            },
            data: {
              visiblity: Visiblity.PROTECTED,
            },
        });
        return channel;
    }
    
    async getPublicChannels(): Promise<Channel[]> {
        const channels = await this.prisma.channel.findMany({
          where: {
            visiblity: Visiblity.PUBLIC,
          },
        });
        return channels;
    }

    async getPrivateChannels(): Promise<Channel[]> {
        const channels = await this.prisma.channel.findMany({
          where: {
            visiblity: Visiblity.PRIVATE,
          },
        });
        return channels;
    }

    async muteUser(
        userId: number,
        channelId: number,
        ): Promise<ChannelMember> 
        {
        const channelMember = await this.prisma.channelMember.update({
            where: {
            userId_channelId: {
                userId,
                channelId,
            },
            },
            data: {
              status: MemberStatus.MUTED,
            },
        });
        return channelMember;
    }

    async unmuteUser(
        userId: number,
        channelId: number,
        ): Promise<ChannelMember> 
        {
        const channelMember = await this.prisma.channelMember.update({
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
        return channelMember;
    }

    async getProtectedChannels(): Promise<Channel[]> {
        const channels = await this.prisma.channel.findMany({
          where: {
            visiblity: Visiblity.PROTECTED,
          },
        });
        return channels;
    }

    async setAsMember(
      ownerId: number,
      channelId: number,
      userId: number,
        ): Promise<ChannelMember> {
          let channelMember = await this.prisma.channelMember.updateMany({
            where: {
              userId,
              channelId,
              channel: 
              {
                channelMembers: {
                  some: {
                    userId: ownerId,
                    role: Role.OWNER || Role.ADMIN,
                  },
                },
              }
            },
            data: {
            role: Role.MEMEBER,
            },
        });

        if (channelMember.count == 0)
        {
          throw new Error('Cannot set user as admin : You are not Admin or Owner of the channel');
        }

        let member = await this.prisma.channelMember.findFirst({
          where: {
              userId,
              channelId,
          },
        });
        return member;
    }

    async getUndeleatedChannelMembers(
        channelId: number,
        ): Promise<ChannelMember[]> {
        const channelMembers = await this.prisma.channelMember.findMany({
            where: {
            channelId,
            isDeleted: false,
            },
        });
        return channelMembers;
    }

    async getchannelMemberByUserIdAndChannelId(
        userId: number,
        channelId: number,
        ): Promise<ChannelMember> {
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
            userId,
            channelId,
            },
        });
        if (!channelMember) throw new Error('Channel member does not exist');
        return channelMember;
  }

}

/*

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'path/to/prisma.service';
import { Channel, ChannelMember } from '@prisma/client';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async getChannelsByUserId(userId: number): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: { userId },
    });

    return channels;
  }

  async getChannelMembersByChannelId(
    channelId: number,
    userId: number,
  ): Promise<ChannelMember[]> {
    const members = await this.prisma.channelMember.findMany({
      where: {
        channelId,
      },
    });

    // filter out banned or left members
    const activeMembers = members.filter(
      (member) => member.userId === userId && member.status === 'active',
    );

    return activeMembers;
  }

  async getChannelById(channelId: number): Promise<Channel | null> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    return channel;
  }

  async createChannel(channelData: {
    name: string;
    description: string;
    userId: number;
  }): Promise<Channel> {
    const channel = await this.prisma.channel.create({
      data: channelData,
    });

    const member = await this.prisma.channelMember.create({
      data: { channelId: channel.id, userId: channelData.userId, status: 'active' },
    });

    return channel;
  }

  async updateChannel(
    channelId: number,
    channelData: {
      name?: string;
      description?: string;
    },
  ): Promise<Channel> {
    const channel = await this.prisma.channel.update({
      where: { id: channelId },
      data: channelData,
    });

    return channel;
  }

  async deleteChannel(channelId: number): Promise<void> {
    await this.prisma.channel.delete({ where: { id: channelId } });
  }

  async addMemberToChannel(
    channelId: number,
    userId: number,
  ): Promise<ChannelMember> {
    const existingMember = await this.prisma.channelMember.findFirst({
      where: { channelId, userId },
    });

    if (existingMember) {
      // user is already a member
      return existingMember;
    }

    const member = await this.prisma.channelMember.create({
      data: { channelId, userId, status: 'active' },
    });

    return member;
  }

  async removeMemberFromChannel(
    channelId: number,
    userId: number,
  ): Promise<void> {
    await this.prisma.channelMember.updateMany({
      where: { channelId, userId },
      data: { status: 'left' },
    });
  }
}


*/