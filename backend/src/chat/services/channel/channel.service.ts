import { Injectable } from '@nestjs/common';
import { Channel, ChannelMember, ChannelType, MemberStatus, Role, Visiblity } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ChannelDto } from 'src/chat/dto';
import { ChatService } from '../chat/chat.service';

@Injectable()

export class ChannelService {

  constructor(private prisma: PrismaService, private chatService: ChatService) 
  {}

  async getChannelsByUserId(userId: number) : Promise<any[]>
  {
      try {
      const channels = await this.prisma.channel.findMany({
        where: {
          channelMembers: {
            some: {
              userId,
              isArchived: false,
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
          select:
          {
              id: true,
              name: true,
              type: true,
              avatar: true,
              userId: true,
              lastestMessageDate: true,
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
              channelMembers:
              {
                include: {
                  user: true,
                },
              },
              messages: true,
          },
      });
      channels.forEach((channel) => {
        if (channel.type === ChannelType.CONVERSATION && channel.userId !== userId
            && channel.updatedAt === channel.createAt) {
            channels.splice(channels.indexOf(channel), 1);
          }
      });

      return channels;
    }
    catch (error) {
        throw new Error(error.message);
    }
  }


  async getAllChannels(userId: number) : Promise<any[]>
  {
      try {
      const channels = await this.prisma.channel.findMany({
        where:
        {
          bannedUsers:
          {
            none:
            {
              id: userId,
            }
          },
          type: ChannelType.GROUP,
          visiblity:
          {
            not: Visiblity.PRIVATE,
          }
        },
          select:
          {
              id: true,
              name: true,
              type: true,
              avatar: true,
              userId: true,
              lastestMessageDate: true,
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
  async searchChannelsByUserId(userId: number, query: string): Promise<Channel[]>
  {
    try {
      const channels = await this.prisma.channel.findMany({
        where: {
          channelMembers: {
            some: {
              userId,
              isArchived: false,
            },
          },
          //deletedfor should't contain the userId
          deletedFor: {
            none: {
              id: {
                equals: userId,
              },
            },
          },
          name: {
            contains: query,
            mode: 'insensitive',
            
          },
        },
        include:
        {
          archivedFor: true,
          mutedFor: true,
          unreadFor: true,
          pinnedFor: true,
          deletedFor: true,
          channelMembers:
          {
            include: {
              user: true,
            },
          },
          messages: true,
        },
      });
      channels.forEach((channel) => {
        if (channel.type === ChannelType.CONVERSATION && channel.userId !== userId
          && !channel.messages.length && channel.updatedAt === channel.createAt) {
            channels.splice(channels.indexOf(channel), 1);
          }
      });
      return channels;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }

  

  async getArchivedChannelsByUserId(userId: number): Promise<Channel[]>
  {
    try {
      const channels = await this.prisma.channel.findMany({
        where: {
          channelMembers: {
            some: {
              userId,
              isArchived: true,
            },
          },
        },

        include:
        {
          archivedFor: true,
          unreadFor: true,
          mutedFor: true,
          pinnedFor: true,
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
  

  async getChannelMembersByChannelId( channelId: number) : Promise<ChannelMember[]> 
  {
    // TODO: check if member is not banned or left the channel already

    const members = await this.prisma.channelMember.findMany({
        where: {
        channelId,
        },
    });
    return members;
  }

  async getChannelById(channelId: number): Promise<Channel | null> 
  {
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

  async getChannelMemberByUserIdAndChannelId( userId: number, channelId: number) 
  : Promise<ChannelMember | null> 
  {
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

  async makeChannel(userId: number, channelData: ChannelDto): Promise<Channel> 
  {
  // Check if another channel exists with the same name
    let hashPassword;
    try {
      const ch = await this.getChannelByName(channelData.name);
      if (ch)
        throw new Error(`Channel ${ch.name} already exists`);
      if (channelData.visibility === Visiblity.PROTECTED && !channelData.password)
        throw new Error('Password is required for protected channel');
      if (channelData.visibility === Visiblity.PROTECTED
        || (channelData.visibility === Visiblity.PRIVATE && channelData.password))
        hashPassword = await this.hashPassword(channelData.password);
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
        data:
        {
          name: channelData.name,
          password: hashPassword,
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
            }
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
    } 
    catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
        
  async updateChannel(userId: number, channelData: ChannelDto): Promise<Channel> 
  {
  // Check if another channel exists with the same name
    let hashPassword;
    let channelMembers;
    console.log(channelData);
    try {
      const ch = await this.getChannelByName(channelData.name);
      if (channelData.visibility === Visiblity.PROTECTED && !channelData.password)
        throw new Error('Password is required for protected channel');
      if (channelData.visibility === Visiblity.PROTECTED
        || (channelData.visibility === Visiblity.PRIVATE && channelData.password))
        hashPassword = await this.hashPassword(channelData.password);
      if (channelData.members)
      {
          channelMembers = channelData.members?.map((memberId: number) => {
          return {
              userId: memberId,
              channelId: channelData.id,
              role: 'MEMBER',
              status: 'ACTIVE',
              isKicked: false,
              isBanned: false,
              isMuted: false,
              isPinned: false,
              isUnread: false,
              isArchived: false,
              isDeleted: false,              
          };
        });
        console.log(channelMembers);
        const chMembers = await this.prisma.channelMember.createMany({
          data: channelMembers,
          skipDuplicates: true,
        });
      }

      const chm = await this.prisma.channelMember.findMany({
        where: {
          channelId: channelData.id,
        },
        //exclude channelId
        select: {
          userId: true,
          role: true,
          status: true,
          isKicked: true,
          isBanned: true,
          isMuted: true,
          isPinned: true,
          isUnread: true,
          isArchived: true,
          isDeleted: true,
        },
      });
        const channel = await this.prisma.channel.update({
        where: {
          id: channelData.id,
        },
        data:
        {
          name: channelData.name,
          password: hashPassword,
          avatar: channelData.avatar,
          visiblity: Visiblity[channelData.visibility],
          type: ChannelType[ChannelType.GROUP],
          channelMembers:
          {
            create : chm,
          },
        },
      });
      return channel;
    } 
    catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async deleteChannel(channelId: number, userId): Promise<number>
  {
    let updated =  await this.prisma.channel.update({
      where: { id: channelId,
      },
      data: {
        deletedFor: {
          connect: {
            id: userId,
        },
      },
    },
    });
    return updated.id;
  }

  async kickUser(
    ownerId: number,
    userId: number,
    channelId: number,
    ): Promise<number> 
    {
      try
      {
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
        throw new Error("You are not authorized to kick a user");
      }
      else
      {
        updated = await this.prisma.channelMember.update({
          where: {
            userId_channelId: {
              userId,
              channelId,
            },
          },
          data: {
            status: MemberStatus.LEFT,
          },
        });
      }
      // add userId to bannedFor
      const channel = await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          kickedUsers: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return updated.count;
    }
    catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
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
            include: {
                channelMembers: true,
            },
        },
        );
        return channel;
      } catch (error) {
          throw new Error(error.message);
      }
    }

    private async hashPassword(password: string): Promise<string> {
      try {
        const passwordHash =  await bcrypt.hash(password, 5).then((hash) => {
          return hash;
        })
        return passwordHash;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
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
            const chaneluser = await this.addUserTochannel(userId, channelId, password);
            return chaneluser;
      }
    
      async addUserTochannel(        
        userId: number,
        channelId: number,
        password?: string,) : Promise<ChannelMember>
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

    async leaveChannel(userId: number, channelId: number): Promise<number> {
      try {
       let ru =  await this.prisma.channelMember.updateMany({
            where: {
            userId,
            channelId,
            },
            data: {
              status: MemberStatus.LEFT,
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

    async getBannedUsers(channelId: number): Promise<ChannelMember[]> {
        const channelMembers = await this.prisma.channelMember.findMany({
          where: {
            channelId,
            status: MemberStatus.BANNED,
          },
        });
        return channelMembers;
    }

    async getLeftUsers(channelId: number): Promise<ChannelMember[]> {
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
    userId: number,
    channelId: number,
      ): Promise<ChannelMember> {

      let owner = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId: ownerId,
            channelId,
          },
        },
      });
      let chMem = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      let newRole : Role = (chMem.role === Role.ADMIN )? Role.MEMEBER : Role.ADMIN;
      if (owner.role !== Role.OWNER)
      {
        throw new Error('Cannot set user as admin : You are not Owner of the channel');
      }
      let update = await this.prisma.channelMember.update({
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
      channelId: number,
      userId: number,
        ): Promise<ChannelMember> {
               let chMem = await this.prisma.channelMember.findFirst({
        where: {
            userId,
            channelId,
        },
      });
      let newRole : Role = (chMem.role === Role.OWNER )? Role.MEMEBER : Role.OWNER;
      let channelMember = await this.prisma.channelMember.updateMany({
        where: {
          userId,
          channelId,
          channel: 
          {
            channelMembers: {
              some: {
                userId: ownerId,
                role: Role.OWNER,
              },
            },
          }
        },
        data: {
          role: newRole,
        },
      });
      
      if (channelMember.count == 0)
      {
        throw new Error('Cannot set user as admin : You are not Admin or Owner of the channel');
      }
      return chMem;
    }

  async pinChannel(
      userId: number,
      channelId: number,
  ): Promise<ChannelMember> 
  {
    const channel = await this.prisma.channel.update({
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

    try
    {
      const chMember = await this.prisma.channelMember.update({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
          data: {
            isPinned: true,
        },
      });
      return chMember;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }

async unpinChannel(
    userId: number,
    channelId: number,
): Promise<ChannelMember>
{
  const channel = await this.prisma.channel.update({
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

  try
  {
    const chMember = await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
        data: {
          isPinned: false,
      },
    });
    return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

async archiveChannel(
  userId: number,
  channelId: number,
): Promise<ChannelMember> 
{
  const channel = await this.prisma.channel.update({
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

  try
  {
    const chMember = await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
        data: {
          isArchived: true,
      },
    });
    return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

async unarchiveChannel(
  userId: number,
  channelId: number,
): Promise<ChannelMember>
{
  
  try
  {
    const channel = await this.prisma.channel.update({
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
    const chMember = await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
        data: {
          isArchived: false,
      },
    });
    return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

async markUnread(userId: number, channelId: number) : Promise<ChannelMember>
{
  try
  {
    const channel = await this.prisma.channel.update(
      {
        where:
        {
          id: channelId,
        },
        data:{
          unreadFor: {
            connect:
            {
              id: userId,
            }
        }
      }
    });
    const chMember = await this.prisma.channelMember.update(
      {
        where:
        {
          userId_channelId:
          {
            userId,
            channelId,
          },
        },
        data:
        {
          isUnread: true,
        },
      });
      return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

async markRead(userId: number, channelId: number) : Promise<ChannelMember>
{
  try
  {
    const channel = await this.prisma.channel.update(
      {
        where:
        {
          id: channelId,
        },
        data:{
          unreadFor: {
            disconnect:
            {
              id: userId,
            }
        }
      }
    });
    const chMember = await this.prisma.channelMember.update(
      {
        where:
        {
          userId_channelId:
          {
            userId,
            channelId,
          },
        },
        data:
        {
          isUnread: false,
        },
      });
      return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
}

async muteChannel(
  userId: number,
  channelId: number,
): Promise<ChannelMember> 
{
  try
  {
    const channel = await this.prisma.channel.update({
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
    const chMember = await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
        data: {
          isMuted: true,
      },
    });
    return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
}



async unmuteChannel(
  userId: number,
  channelId: number,
): Promise<ChannelMember>
{
  const channel = await this.prisma.channel.update({
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

  try
  {
    const chMember = await this.prisma.channelMember.update({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
        data: {
          isMuted: false,
      },
    });
    return chMember;
  }
  catch (error) {
    throw new Error(error.message);
  }
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
      ownerId: number,
      userId: number,
      channelId: number,
      ): Promise<number> 
      {
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
          throw new Error("You are not authorized to mute a user");
        }
        else
        {
            updated = await this.prisma.channelMember.update({
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
      return updated.count;
  }

  async unmuteUser(
      ownerId: number,
      userId: number,
      channelId: number,
      ): Promise<number> 
      {
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
          throw new Error("You are not authorized to mute a user");
        }
        else
        {
            updated = await this.prisma.channelMember.update({
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
        }
      return updated.count;
  }

  async banUser(
      ownerId: number,
      userId: number,
      channelId: number,
      ): Promise<number> 
      {
        try
        {
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
          throw new Error("You are not authorized to ban a user");
        }
        else
        {
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
        const channel = await this.prisma.channel.update({
          where: {
            id: channelId,
          },
          data: {
            bannedUsers: {
              connect: {
                id: userId,
              },
            },
          },
        });
        return updated.count;
      }
      catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
  }

  async unbanUser(
      ownerId: number,
      userId: number,
      channelId: number,
      ): Promise<number> 
      {
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
          throw new Error("You are not authorized to ban a user");
        }
        else
        {
            updated = await this.prisma.channelMember.update({
            where: {
              userId_channelId: {
                userId,
                channelId,
              },
            },
            data: {
              status: MemberStatus.LEFT,
            },
        });
        }
        const channel = await this.prisma.channel.update({
          where: {
            id: channelId,
          },
          data: {
            bannedUsers: {
              disconnect: {
                id: userId,
              },
            },
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
