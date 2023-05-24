import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ChatService } from './services/chat/chat.service';
import { DmService } from './services/dm/dm.service';
import { ChannelService } from './services/channel/channel.service';
import { MessageService } from './services/message/message.service';
import { ChannelDto, DmDto, MessageDto } from './dto';
import { ChannelType, MemberStatus, Message, Visiblity } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import * as EVENT from  "./utils/"
import { get } from 'http';


@WebSocketGateway({ namespace: 'chat', cors: true, origins: 'http://127.0.0.1:3000' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect  {
  @WebSocketServer()
  server: Server;
  private connectedClient : Map<number,Socket> = new Map();
  // private cookie;
  constructor(
              private chatService: ChatService,
              private dmService: DmService,
              private channelService: ChannelService,
              private messageService: MessageService,
              private jwtService: JwtService) 
              {
                // this.cookie = require('cookie');
              }
              
  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    try {

      await this.verifyClient(client);
      if (!client.data)
      {
        // console.log("client not verified");
        this.disconnect(client);
      }
      // else
      //   console.log("client verified");
      this.connectedClient.set(client.data.id, client);
      await this.joinChannels(client);
      await this.sendChannelsToClient(client)
      // To do : Add events to handle the online status of friends
      // console.log("connected");
      // client.emit("ping", "pong");

    } catch (error) {
      this.disconnect(client, error)
    }
  }
  
  async handleDisconnect(client: Socket) {
    if (client.data.id) 
      this.connectedClient.delete(client.data.id);
      //To do : add events to handle the online status of friends
  }
  
  async disconnect(client: Socket, error?) {
    client.emit(error, new UnauthorizedException())
    client.disconnect();
  };

  // @SubscribeMessage("ping")
  // ping(client: Socket, payload: any) {
    //   client.emit("ping", "pong");
    //   console.log(payload);
    // }
    
@SubscribeMessage(EVENT.MESSAGE)
async sendMessage(client: Socket, payload: any) {
  try {
    const dto : MessageDto = {
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      content: payload.content,
    }
    const message =  this.messageService.makeMessage(dto).then((message) => { return message; });
    await this.sendChannelsToChannelMembers(dto.receiverId);
    await this.sendMessageToChannelMembers(dto.senderId, dto.receiverId, message);
    } catch (err) {
      throw new WsException({
        error: EVENT.MESSAGE,
        message: err.message,
      });
    }
}


  @SubscribeMessage(EVENT.DM_CREATE)
  async createDm(client: Socket, payload: DmDto) {
    try {
      //create a dm send channels to user
      const dm =  await this.dmService.makeDm(payload).then((dm) => { return dm; });
      if (!dm)
      {
        throw new WsException({
          error: EVENT.DM_CREATE,
          message: 'Cannot create dm',
        });
      }
      let sockets = this.getConnectedUsers(client.data.id);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.join(dm.id.toString());
        this.server.to(s.id).emit(EVENT.DM_CREATE, dm);
      });
    } catch (err) {
      throw new WsException({
        error: EVENT.DM_CREATE,
        message: err.message,
      });
    }
  }
  

  @SubscribeMessage(EVENT.GET_CH_MEMBER)
  async getChannelMember(client: Socket, payload: any) {
    try
    {
      const members = await this.channelService.getChannelMemberByUserIdAndChannelId(payload.userId, payload.channelId);
      client.emit(EVENT.GET_CH_MEMBER, members);
    }
    catch (err)
    {
      throw new WsException({
        error: EVENT.GET_CH_MEMBER,
        message: err.message,
      });
    }
  }
  //create a new group channel
  
  @SubscribeMessage(EVENT.CHANNEL_CREATE)
  async createChannel(client: Socket, payload: ChannelDto) {
    console.log(payload);
    // this.validatePayload(payload);
    try {
      const channel = await this.channelService.makeChannel(client.data.id | 1, payload);
      console.log(payload);
      if (!channel)
      {
        throw new WsException({
          error: EVENT.CHANNEL_CREATE,
          message: 'Cannot create channel',
        });
      }    
      let sockets = this.getConnectedUsers(client.data.id);
      payload.members.forEach((m) => {
        if (!this.chatService.isBlocked(client.data.id, m))
        sockets = sockets.concat(this.getConnectedUsers(m));
      })
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.join(channel.id.toString());
        this.server.to(s.id).emit(EVENT.CHANNEL_CREATE, channel);
      });
      this.sendChannels(client.data.id);
      
    } 
    catch (error) {
      console.log(error);
      throw new WsException({
        error: EVENT.CHANNEL_CREATE,
        message: error.message,
      });
    }
  }

  @SubscribeMessage(EVENT.GET_CHANNELS)
  async getChannels(client: Socket, payload: any): Promise<void> {
    try {
      const channels = await this.channelService.getChannelsByUserId(payload.user.id);
      client.emit(EVENT.GET_CHANNELS, channels);
    } catch (err) {
      console.log(err);
      throw new WsException({
        error: EVENT.GET_CHANNELS,
        message: err.message,
      });
    }
  }

  async joinRoom(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.JoinChannel(
        client.data.id,
        payload.channelId,
        payload.password,
      );
      const sockets = this.getConnectedUsers(client.data.id);
      sockets.forEach((s) => {
        s.join(payload.channelId);
        this.server.to(s.id).emit(EVENT.CHANNEL_JOIN, ru)
      });      
      this.sendChannels(client.data.id);
      // this.sendChannelToMembers(client.data.id, payload.channelId, ru);
    } catch (err) {
      throw new WsException({
        error: EVENT.CHANNEL_JOIN,
        message: err.message,
      });
    }
  }
  
  
  @SubscribeMessage(EVENT.CHANNEL_SEARCH)
  async findRoom(client: Socket, payload: any) {
    try {
      const rooms = await this.channelService.findChannelsByName(
        client.data.id,
        payload.name,
        );
        
        client.emit(EVENT.CHANNEL_SEARCH, rooms);
      } catch (err) {
        throw new WsException({
          error: EVENT.CHANNEL_SEARCH,
        message: err.message,
      });
    }
  }
  
  @SubscribeMessage(EVENT.GET_CH_MEMBERS)
  async ChannelMembers(client: Socket, channelId: string) {
    try {
      const members = await this.channelService.getChannelMembersByChannelId(
        parseInt(channelId),
        );
        
        client.emit(EVENT.GET_CH_MEMBERS, members);
    } catch (err) {
      throw new WsException({
        error: EVENT.GET_CH_MEMBERS,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.CHANNEL_LEAVE)
  async leaveChannel(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.leaveChannel(
        payload.userId,
        payload.channelId,
        );
        console.log(payload);
        client.leave(payload.channelId);
        const channels = await this.channelService.getChannelsByUserId(payload.userId);
        client.emit(EVENT.CHANNEL_LEAVE, channels);
        const sockets = this.getConnectedUsers(payload.userId);
        sockets.forEach((s) => {
          s.leave(payload.channelId);
          this.server.to(s.id).emit(EVENT.CHANNEL_LEAVE, ru)
        });
        this.sendChannels(payload.userId);
      } catch (err) {
        throw new WsException({
          error: EVENT.CHANNEL_LEAVE,
          message: err.message,
        });
      }
    }

    @SubscribeMessage(EVENT.SET_ADMIN)
    async setAdmin(client: Socket, payload: any) {
      try {
        const ru = await this.channelService.setAsAdmin(
          1,
          parseInt(payload.channelId),
          parseInt(payload.userId),
          );
        const channel = await this.channelService.getChannelById(parseInt(payload.channelId));
          client.emit(EVENT.SET_ADMIN, channel);
          const sockets = this.getConnectedUsers(client.data.id);
          sockets.forEach((s) => {
            this.server.to(s.id).emit(EVENT.SET_ADMIN, ru)
          });
          this.sendChannels(client.data.id);
        } catch (err) {
          throw new WsException({
            error: EVENT.SET_ADMIN,
            message: err.message,
          });
        }
      }
  
  
  @SubscribeMessage(EVENT.BAN_FROM_CHANNEL)
  async banFromChannel(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.BanUserFromChannel(
        parseInt(client.data.id),
        parseInt(payload.channelId),
        parseInt(payload.userId),
        );
        const sockets = this.getConnectedUsers(client.data.id);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.BAN_FROM_CHANNEL, ru)
        });
        this.sendChannels(client.data.id);
      } catch (err) {
        throw new WsException({
          error: EVENT.BAN_FROM_CHANNEL,
          message: err.message,
        });
      }
    }

  @SubscribeMessage(EVENT.REMOVE_CHANNEL_MEMBER)
  async removeChannelMember(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.removeMemberFromChannel(
        client.data.id,
        payload.channelId,
        payload.userId,
        );
        const sockets = this.getConnectedUsers(client.data.id);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.REMOVE_CHANNEL_MEMBER, ru)
        });
        this.sendChannels(client.data.id);
      } catch (err) {
        throw new WsException({
          error: EVENT.REMOVE_CHANNEL_MEMBER,
          message: err.message,
        });
      }
    }


  @SubscribeMessage(EVENT.GET_CH_MSSGS)
  async ChannelMessages(client: Socket, payload: any) {
    try {
      const messages = await this.messageService.getMessagesByChannelId(
        payload.channelId, payload.user.id
        );
        client.emit(EVENT.GET_CH_MSSGS, messages);
      } catch (err) {
        throw new WsException({
          error: EVENT.GET_CH_MSSGS,
          message: err.message,
        });
      }
    }

    @SubscribeMessage(EVENT.GET_DM_MSSGS)
    async DmMessages(client: Socket, dmId: string) {
      try {
        const messages = await this.messageService.getMessagesByChannelId(
          parseInt(dmId), client.data.id
          );
        } catch (err) {
          throw new WsException({
            error: EVENT.GET_DM_MSSGS,
            message: err.message,
          });
        }
      }

    @SubscribeMessage(EVENT.CHANNEL_DELETE)
    async deleteChannel(client: Socket, channelId: string) {
      try {
          await this.channelService.deleteChannel(
          parseInt(channelId), client.data.id
          );
          const sockets = this.getConnectedUsers(client.data.id);
          sockets.forEach((s) => {
            s.leave(channelId);
            // this.server.to(s.id).emit(EVENT.CHANNEL_DELETE, channel)
          });
          this.sendChannels(client.data.id);
        } catch (err) {
          throw new WsException({
            error: EVENT.CHANNEL_DELETE,
            message: err.message,
          });
        }
      }

      @SubscribeMessage(EVENT.PIN_CHANNEL)
      async pinChannel(client: Socket, payload: {channelId: string, userId: string}) { // to do userId could be get from backend directly ...
        try {
          const channel = await this.channelService.pinChannel(
            parseInt(payload.userId), parseInt(payload.channelId)
            );
            const sockets = this.getConnectedUsers(client.data.id);
          } catch (err) {
            throw new WsException({
              error: EVENT.PIN_CHANNEL,
              message: err.message,
            });
          }
        }

        @SubscribeMessage(EVENT.UNPIN_CHANNEL)
        async unpinChannel(client: Socket, channelId: string) {
          try {
            const channel = await this.channelService.unpinChannel(
              parseInt(channelId)
              );
            } catch (err) {
              throw new WsException({
                error: EVENT.UNPIN_CHANNEL,
                message: err.message,
              });
            }
          }

          @SubscribeMessage(EVENT.MUTE_CHANNEL)
          async muteChannel(client: Socket, channelId: string) {
            try {
              const channel = await this.channelService.muteChannel(
                parseInt(channelId)
                );
              } catch (err) {
                throw new WsException({
                  error: EVENT.MUTE_CHANNEL,
                  message: err.message,
                });
              }
            }

            @SubscribeMessage(EVENT.UNMUTE_CHANNEL)
            async unmuteChannel(client: Socket, channelId: string) {
              try {
                const channel = await this.channelService.unmuteChannel(
                  parseInt(channelId)
                  );
                } catch (err) {
                  throw new WsException({
                    error: EVENT.UNMUTE_CHANNEL,
                    message: err.message,
                  });
                }
              }



          // @SubscribeMessage(EVENT.GET_PINNED_CHANNELS)
          // async getPinnedChannels(client: Socket) {
          //   try {
          //     const channels = await this.channelService.getPinnedChannels();
          //     client.emit(EVENT.GET_PINNED_CHANNELS, channels);
          //   } catch (err) {
          //     throw new WsException({
          //       error: EVENT.GET_PINNED_CHANNELS,
          //       message: err.message,
          //     });
          //   }
          // }


  //edit a channel
  //delete a channel
  //delete a message
  //delete a conversation

  /* -------------------------------------- Helper functions -------------------------------------*/

  private async verifyClient(client) {
    let token: string = client.handshake.auth.token as string;
    // console.log(client.handshake)
    //romove Bearer from token
    if(token.search("Bearer") !== -1)
        token = token.split(" ")[1];
    try
    {
      const data = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET});
      client.data = data;
      // console.log("client data", client.data);
      return data;
    }
    catch (err)
    {
      console.log(err);
      throw new WsException({
        error: "Authentication failed",
        message: err.message,
      });
    }
}

  private async joinChannels(client)
  {
    const channels = await this.channelService.getChannelsByUserId(client.data.id);
    channels.forEach((channel) => {
      client.join(channel.id);
    });
  }

  //get realtime channels when added to a channel or when connected

  private async sendChannelsToClient(client: Socket) {
    const channels = await this.channelService.getChannelsByUserId(client.data.id);
    client.emit("ListOfChannels", channels);
  }

  private async sendChannelsToChannelMembers(channelId: number) 
  {
    let members = await this.channelService.getChannelMembersByChannelId(channelId);
    members.forEach(member =>
      {
        if (member.status === MemberStatus.BANNED) // || member.status === MemberStatus.LEFT)
          return;
        const sockets = this.getConnectedUsers(member.userId);
        const channels = this.channelService.getChannelsByUserId(member.userId);
        sockets.forEach(socket =>
            {
              this.server.to(socket.id).emit("channelsList", channels)
            });
      });
  }

  private async sendMessageToChannelMembers(senderId: number, channelId: number, message: any)
  {

    let members = await this.channelService.getChannelMembersByChannelId(channelId);

    members.forEach(member =>
      {
        if (member.status === MemberStatus.BANNED && this.chatService.isBlocked(senderId, member.userId) )
          return;
        const sockets = this.getConnectedUsers(member.userId);
        sockets.forEach(socket =>
            {
              this.server.to(socket.id).emit("message", this.messageService.formatingMessage(message))
            });
      });
  }

  private getConnectedUsers(id: number): Socket[]
  {
    let connectedUsers: Socket[] = [];
    this.connectedClient.forEach(user => {
      if (user.data.id === id)
        connectedUsers.push(user);
    });
    return connectedUsers;
  }

  // private validatePayload(payload: any)
  // {
  //   if (
  //     !(
  //       'name' in payload &&
  //       'visibility' in payload &&
  //       'password' in payload &&
  //       'avatar' in payload &&
  //       'users' in payload
  //     )
  //   ) {
  //     throw new WsException({
  //       error: "createChannel",
  //       message: 'Cannot create channel group',
  //     });
  //   }

  //   if (
  //     typeof payload.name !== 'string' ||
  //     typeof payload.visibility !== 'string' ||
  //     typeof payload.password !== 'string' ||
  //     typeof payload.image !== 'string' ||
  //     !Array.isArray(payload.users)
  //   ) {
  //     throw new WsException({
  //       error: "createChannel",
  //       message: 'Cannot create channel group',
  //     });
  //   }
  //   if (payload.privacy === Visiblity.PROTECTED) {
  //     if (payload.password === '') {
  //       throw new WsException({
  //         error: "channel_protection",
  //         message: "the channel require a password",
  //       });
  //     }
  //   }
  // }

  private async sendChannels(userId: number)
  {
    const sockets = this.getConnectedUsers(userId);
    const channels = await this.channelService.getChannelsByUserId(userId);
    for (const socket of sockets) {
      this.server.to(socket.id).emit("channelsList", channels);
    }
  }
}




