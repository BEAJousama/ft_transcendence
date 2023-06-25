import { Injectable, NotFoundException } from '@nestjs/common';
import { Channel, ChannelType } from '@prisma/client';
import { DmDto } from 'src/chat/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class DmService {
    constructor(private prisma: PrismaService,  private chatService : ChatService)
    {
    }

    async makeDm(data: DmDto) : Promise<Channel | null>
    {
        try {
            let dm =  await this.getDmByUserIds(data.senderId, data.receiverId);
            if (dm)
                return dm;
            if(await this.chatService.isBlocked(data.senderId, data.receiverId))
                throw new NotFoundException('Cannot send message to this user !');
            dm =  await this.prisma.channel.create({
                    data: {
                        name: "Dm" + data.senderId + data.receiverId,
                        avatar: "",
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
            if (!dm)
                return null;
            return dm;
        }
        catch (e) {
            console.log(e)
        }

    }

    async deleteDm(id: number)
    {
        await this.prisma.channel.delete({
            where: {
                id,
            },
        });
    }

    async updateDm(id: number,dm: DmDto)
    {
        await this.prisma.channel.update({
            where: {
                id,
            },
            data: {
                name: dm.name,
                avatar: dm.avatar,
            },
        });

    }

    async getDmById(id: number)
    {
        let dm = await this.prisma.channel.findUnique({
            where: {
                id,
            },
        });
        if (!dm)
            return null;
        return dm;
    }

    // async getDmChannel(userId1: number, userId2: number): Promise<Channel> {
    //     const [channel] = await this.prisma.channel.findMany({
    //       where: {
    //         type: ChannelType.CONVERSATION,
    //         channelMembers: {
    //           every: {
    //             userId: {
    //               in: [userId1, userId2],
    //             },
    //           },
    //         },
    //       },
    //       select: {
    //         id: true,
    //         name: true,
    //         avatar: true,
    //         channelMembers: {
    //           where: {
    //             userId: {
    //               not: {
    //                 in: [userId1, userId2],
    //               },
    //             },
    //           },
    //           select: {
    //             user: {
    //               select: {
    //                 username: true,
    //                 avatar: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     });
      
    //     if (!channel) {
    //       throw new NotFoundException('DM channel not found');
    //     }
      
    //     const otherMember = channel.channelMembers[0].user;
    //     channel.name = otherMember.username;
    //     channel.avatar = otherMember.avatar;
      
    //     return channel;
    //   }
      

    async getDmsByUserId(userId: number)
    {
        let dms = await this.prisma.channel.findMany({
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

    async getDmByUserIds(userId: number, receiverId: number)
    {
        let dm = await this.prisma.channel.findFirst({
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
        if (!dm)
            return null;
        return dm;
    }

    async getDmByUsernames(username: string, receiverUsername: string)
    {
        let dm = await this.prisma.channel.findFirst({
            where: {
                channelMembers: {
                    every: {
                        user: {
                            username: {
                                in: [username, receiverUsername],
                            },
                        },
                    },
                },
                type: ChannelType.CONVERSATION,
            },
        });
        if (!dm)
            return null;
        return dm;
    }


}
