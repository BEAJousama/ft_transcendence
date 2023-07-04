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
              isacessPassword: true,
          },
      });

      channels.forEach((channel) => {
        if (channel.userId != userId && channel.type === ChannelType.CONVERSATION && 
            channel.updatedAt.toString() === channel.createAt.toString()) {
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

  async getArchivedChannelsByUserId(userId: number): Promise<Channel[]>
  {
    try {
      const channels = await this.prisma.channel.findMany({
        where: {
          channelMembers: {
            some: {
              userId,
            },
          },
          archivedFor : { 
            some: {
              id: userId,
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
    const members = await this.prisma.channelMember.findMany({
        where: {
        channelId,
        },
    });
    return members;
  }

  async getChannelById(channelId: number): Promise<any | null> 
  {
    const channel = await this.prisma.channel.findUnique({
        where: { 
          id: channelId
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
          isacessPassword: true,
        }
    });
    return channel;
  }

  async getChannelByIdWithPass(channelId: number): Promise<any | null> 
  {
    const channel = await this.prisma.channel.findUnique({
        where: { 
          id: channelId
        },
        select:
        {
          id: true,
          password: true,
          visiblity: true,
        }
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
    let hashPassword : string;
    let accesspass : string;
    let isaccesspass : boolean = false;
    try {
      const ch = await this.getChannelByName(channelData.name);
      if (ch)
        throw new Error(`Channel ${ch.name} already exists`);
      if (channelData.visibility === Visiblity.PROTECTED && !channelData.password)
        throw new Error('Password is required for protected channel');
      if (channelData.visibility === Visiblity.PROTECTED
        || (channelData.visibility === Visiblity.PRIVATE && channelData.password))
        hashPassword = await this.hashPassword(channelData.password);
      if (channelData.access_pass)
      {
        isaccesspass = true;
        accesspass = await this.hashPassword(channelData.password)
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
        data:
        {
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
      throw new Error(error.message);
    }
  }

  async updatePassword(userId: number, channelId: number, password: string): Promise<Channel>
  {
    try {
      const ch = await this.getChannelById(channelId);
      if (!ch)
        throw new Error(`Channel not found`);
      const channelMember = await this.getChannelMemberByUserIdAndChannelId(userId, channelId);
      if (channelMember.role !== Role.OWNER && channelMember.role !== Role.ADMIN)
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
    }
    catch (error) {
      throw new Error(error.message);
    }
  }


        
  async updateChannel(userId: number, channelData: ChannelDto): Promise<Channel> 
  {
    let hashPassword;
    let channelMembers;

    try {
      let channel = await this.getChannelById(channelData.id);
      if (channelData.type === "name")
      {
        const ch = await this.getChannelByName(channelData.name);
        const chbyid = await this.getChannelById(channelData.id);
        if (chbyid.name === channelData.name)
           return chbyid;
        if (ch)
          throw new Error(`Channel ${ch.name} already exists`);
        await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data:
          {
            name: channelData.name,
          },
        });
        return channel;
      }
      if (channelData.type === "avatar")
      {
        let channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data:
          {
            avatar: channelData.avatar,
          },
        });
        return channel;
      }
      if (channelData.type === "visibility")
      {
        const ch = await this.getChannelById(channelData.id);
        if (ch.visiblity !== Visiblity.PROTECTED && channelData.visibility === Visiblity.PROTECTED && !channelData.password)
          throw new Error('Password is required for protected channel');
        else if (ch.visiblity === Visiblity.PROTECTED && channelData.visibility === Visiblity.PROTECTED && channelData.password)
        {
          hashPassword = await this.hashPassword(channelData.password);
          let channel = await this.prisma.channel.update({
            where: {
              id: channelData.id,
            },
            data:
            {
              visiblity: Visiblity[channelData.visibility],
              password: hashPassword,
            },
          });
          return channel;
        }
        else if (ch.visiblity === Visiblity.PROTECTED && channelData.visibility === Visiblity.PROTECTED && !channelData.password)
        {
          let channel = await this.prisma.channel.update({
            where: {
              id: channelData.id,
            },
            data:
            {
              visiblity: Visiblity[channelData.visibility],
            },
          });
          return channel;
        }
        let channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data:
          {
            visiblity: Visiblity[channelData.visibility],
          },
        });
        return channel;
      }
      if (channelData.type === "members")
      {
        // check if member already exists and its status is LEFT and make it active
        if (channelData.members)
        {
          channelData.members.forEach(async (memberId) => {
            const channelMember = await this.getChannelMemberByUserIdAndChannelId(memberId, channelData.id);
            if (channelMember && channelMember.status === MemberStatus.LEFT)
            {
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

              await this.prisma.channel.update(
                {
                  where :
                  {
                    id: channelData.id,
                  },
                  data:
                  {
                    kickedUsers:
                    {
                      disconnect:
                      {
                        id: memberId,
                      }
                    }
                  }
                }
              )
              channelData.members = channelData.members.filter(member => member !== memberId);
            }});

            channelMembers = channelData.members.map((member) => {
              return { user: { connect: { id: member }  } }
            });

            await this.prisma.channel.update({
            where: {
              id: channelData.id,
            },
            data:
            {
              channelMembers:
              {
                create : channelMembers,
              },
          },
          });

        }
        return channel;
      }
      if (channelData.type === "access_pass")
      {
        hashPassword = await this.hashPassword(channelData.access_pass);
        let channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data:
          {
            accessPassword: hashPassword,
            isacessPassword: true,
          },
        });
        return channel;
      }
      if (channelData.type === "rm_access_pass")
      {
        let channel = await this.prisma.channel.update({
          where: {
            id: channelData.id,
          },
          data:
          {
            accessPassword: null,
            isacessPassword: false,
          },
        });
        return channel;
      }
      return channel;
    } 
    catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteChannel(channelId: number, userId): Promise<number>
  {
    try {
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
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeChannel(userId: number, channelId: number): Promise<number>
  {
    try
    {
      let chanelMember = await this.getChannelMemberByUserIdAndChannelId(userId, channelId);
      if (chanelMember.role !== Role.OWNER)
        throw new Error(`Only the owner can remove this channel`);
      let updated =  await this.prisma.channel.delete({
        where: { id: channelId,
        },
      });
      return updated.id;
    }
    catch (error) {
      throw new Error(error.message);
    }
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
        throw new Error(error.message);
    }
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

  private async hashPassword(password: string): Promise<string> 
  {
    try {
      const passwordHash =  await bcrypt.hash(password, 5).then((hash) => {
        return hash;
      })
      return passwordHash;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async verifyPassword(
  password: string,
  hash: string,
  ): Promise<boolean> 
  {
      return await bcrypt.compare(password, hash);
  }

  async JoinChannel(
    userId: number,
    channelId: number,
    password?: string,
  ): Promise<ChannelMember> 
  {
    try
    {
      const channel = await this.getChannelById(channelId);
      if (!channel) throw new Error('channel does not exist');
      if (channel.type === ChannelType.CONVERSATION) throw new Error('Cannot join a conversation');
      if (channel.visiblity === Visiblity.PRIVATE)
      throw new Error('Cannot join a private channel');
      const chaneluser = await this.addUserTochannel(userId, channelId, password);
      return chaneluser;
    }
    catch(error)
    {
      throw new Error(error.message);
    }
  }
  
  async addUserTochannel(        
      userId: number,
      channelId: number,
      password?: string,) : Promise<ChannelMember>
  {
      const channel = await this.getChannelByIdWithPass(channelId);
      if (!channel) 
        throw new Error('Channel does not exist');
      const isCorrect = await this.verifyPassword(password, channel.password);
      console.log(isCorrect);
      if (channel.visiblity === Visiblity.PROTECTED && !isCorrect)
      {
        throw new Error('Incorrect Channel password');
      }
      const exists: ChannelMember = await this.getchannelMemberByUserIdAndChannelId(
        userId,
        channelId,
        );
      console.log(password);
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
            kickedUsers: {
              disconnect: {
                id: userId,
              },
            },
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

  async checkMute(userId: number, channelId: number): Promise<boolean> {
    let chMem = await this.prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });
    if (chMem.banDuration && chMem.banDuration < new Date().getTime() / 1000 - chMem.banStartTime.getTime() / 1000 && chMem.status === MemberStatus.MUTED)
    {
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        }
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        }
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
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
      const chMember = await this.prisma.channelMember.findUnique(
        {
          where:
          {
            userId_channelId:
            {
              userId,
              channelId,
            },
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
      const chMember = await this.prisma.channelMember.findUnique(
        {
          where:
          {
            userId_channelId:
            {
              userId,
              channelId,
            },
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        }
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
      const chMember = await this.prisma.channelMember.findUnique({
        where: {
          userId_channelId: {
            userId,
            channelId,
          },
        },
      });
      return chMember;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }

  async muteUser(
      ownerId: number,
      userId: number,
      channelId: number,
      banDuration: number,
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
