import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessageDto } from 'src/chat/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
    constructor(private prisma: PrismaService) 
    {}

    async makeMessage(
      data : MessageDto,
    ): Promise<Message | null> {
        // if (data.senderId === data.receiverId)
        //     throw new Error("Cannot send message to yourself !");
        //check if sender is blocked from channel
        
        let message = this.prisma.message.create({
            data,
        }).then((message) => {;
            if (!message) 
            {
                console.log("Cannot create message !");
                return null;
            }
            return message;
        });
        return message;
    }

    async deleteMessage(userId, messageId)
    {
        let message = await this.prisma.message.findFirst({
            where:
            {
                OR: [
                    {
                        id: messageId,
                        senderId: userId,
                    },
                    {
                        id: messageId,
                        receiverId: userId,
                    },
                ],
            }
        });
        
        if (!message)
            throw new Error("Cannot delete message !");
        this.prisma.message.delete({
            where: {
                id: messageId,
            },
        });

        return {message: "message deleted !"};
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
        
        if (!channelmember || channelmember.status ===  "BANNED"  || channelmember.status === "MUTED")
            throw new Error("cannot get messages!");

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
