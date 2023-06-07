import { Injectable } from '@nestjs/common';
import { MemberStatus, Message } from '@prisma/client';
import { MessageDto } from 'src/chat/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) 
    {}

    async makeMessage(
      data : MessageDto,
    ): Promise<Message | null> {

        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                userId: data.senderId,
                channelId: data.receiverId,
                status: "BANNED",
            },
        });
        if (channelMember)
            throw new Error("Cannot send message to this channel !");
        let message = await this.prisma.message.create({
            data: {
                content: data.content,
                senderId: data.senderId,
                receiverId: data.receiverId,
            },
        })
        if (!message) 
        {
            console.log("Cannot create message !");
            return null;
        }
        await this.prisma.channel.update({
            where: {
                id: data.receiverId,
            },
            data: {
                newMessagesCount: {
                    increment: 1,
                },
                deletedFor: {
                    set: [],
                },
                lastestMessageDate: message.date,
                updatedAt: message.date,
                                
            },
        });
        return message;
    }

    async deleteMessage(userId, messageId)
    {
        let message = await this.prisma.message.findFirst({
            where:
            {
                id: messageId,
                senderId: userId,
            }
        });
        
        if (!message)
            throw new Error("Cannot delete message !");
        await this.prisma.message.delete({
            where: {
                id: messageId,
            },
        });
        console.log("Message deleted !");
        return {message: "message deleted !"};
    };

    async pinMessage(messageId, pinnerId)
    {
        let message = await this.prisma.message.findUnique(
            {
                where:{
                    id: messageId,
                }
            }
            );
            if (!message)
                throw new Error("Cannot pin message !");
            await this.prisma.message.update(
                {
                    where:{
                        id: messageId,
                    },
                    data: {
                        pinned : true,
                        pinnerId,
                    },
                }
                );
        return {message: "message pinned !"};
    };

    async UnpinMessage(messageId, pinnerId)
    {
        
        let message = await this.prisma.message.findUnique(
            {
                where:{
                    id: messageId,
                }
            }
        );
        if (!message || message.pinnerId != pinnerId)
            throw new Error("Cannot pin message !");
        await this.prisma.message.update(
            {
                where:{
                    id: messageId,
                },
                data: {
                    pinned : false,
                    pinnerId,
                },
            }
        );
        return {message: "message pinned !"};
    };


    async updateMessage(messageId, data : MessageDto)
    {
        let message = await this.prisma.message.findUnique(
            {
                where:{
                    id: messageId,
                }
            }
        );

        if (message.senderId != data.senderId)
            throw new Error("Cannot update message !");
        await this.prisma.message.update(
            {
                where:{
                    id: messageId,
                },
                data: data,
            }
        );
    }

    async getMessagesByChannelIdOnly(channelId: number)
    {
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

    async getMessagesByChannelId(channelId: number, userId: number) : Promise<Message[]> {

        const channel = await this.prisma.channel.findUnique(
            {
                where:{
                    id: channelId,
                },
            });
        const channelmember = await this.prisma.channelMember.findFirst(
            {
                where:
                {
                    channelId,
                    userId,
                }
            });
        if (!channelmember || channelmember.status === MemberStatus.BANNED)
        {
            throw new Error("User cannot get messages!");
        }

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

    async getPinnedMessages(channelId: number, userId: number) : Promise<Message[]>
    {
        const channelmember = await this.prisma.channelMember.findFirst(
            {
                where:
                {
                    channelId,
                    userId,
                }
            });
        if (!channelmember || channelmember.status === MemberStatus.BANNED)
        {
            throw new Error("User cannot get messages!");
        }
        
        const messages = await this.prisma.message.findMany({
            where: {
                receiverId: channelId,
                pinned: true,
            },
            include: {
                sender: true,
                receiver: true,
            },
        });
        return messages;
    }

    

    formatingMessage(message: any): any {
        return {
        id: message.id,
        content: message.content,
        createdAt: message.date,
        channelId: message.receiverId,
        channelName: message.channel.name,
        user: {
            id: message.channelMember.user.id,
            username: message.channelMember.user.username,
            avatar: message.channelMember.user.avatar,
        },
        };
    }
}
