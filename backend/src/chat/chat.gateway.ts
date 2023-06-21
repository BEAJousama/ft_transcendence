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
import { ChannelType, MemberStatus, Visiblity } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import * as EVENT from  "./utils/"


@WebSocketGateway({ namespace: 'chat', cors: true, origins: '*' })
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
              private jwtService: JwtService,
              private userService: UsersService,
              )
              
              {
                // this.cookie = require('cookie');
              }
        
/* -------------------------------------- Handle Server Connection -------------------------------------*/

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    try {
      
      await this.verifyClient(client);
      // if (!client.data)
      // {
      //   console.log("client not verified");
      //   this.disconnect(client);
      // }
      // if (client.data.sub)
      // user.status = UserStatus.ONLINE;
      // this.userService.updateUser({id:});
      // else
      //   console.log("client verified");
      this.connectedClient.set(client.data.sub, client);
      await this.joinChannels(client);
      await this.sendChannelsToClient(client)

      // To do : Add events to handle the online status of friends
      // console.log("connected");
      // client.emit("ping", "pong");
      
    } catch (error) {
      this.disconnect(client, error)
      //retutn ws exception
      new WsException({
        error: "connection",
        message: error.message,
      });
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.sub)
    {
      // this.userService.updateUserStatus(client.data.sub, UserStatus.OFFLINE);
      this.connectedClient.delete(client.data.sub);
    }

    //To do : add events to handle the online status of friends
  }

  async disconnect(client: Socket, error?) {
    client.emit(error, new UnauthorizedException())
    client.disconnect();
  };

/* -------------------------------------- WEBSOCKET EVENTS HANDLERS -------------------------------------*/
    
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
      const dm =  await this.dmService.makeDm(payload);
      if (!dm)
      {
        throw new WsException({
          error: EVENT.DM_CREATE,
          message: 'Cannot create dm',
        });
      }
      const channelTosend = await this.channelService.getChannelById(dm.id);
      let sockets = this.getConnectedUsers(client.data.sub);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.join(dm.id.toString());
        this.server.to(s.id).emit(EVENT.DM_CREATE, channelTosend);
      });
    } catch (err) {
      throw new WsException({
        error: EVENT.DM_CREATE,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.SEARCH_CHANNEL)
  async searchChannel(client: Socket, payload: any) {
    try {
      const channels = await this.channelService.searchChannelsByUserId(client.data.sub, payload.query);
      client.emit(EVENT.SEARCH_CHANNEL, channels);
    } catch (err) {
      throw new WsException({
        error: EVENT.SEARCH_CHANNEL,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.KICK_USER)
  async kickUser(client: Socket, payload: any) {
    try {
      const kicked = await this.channelService.kickUser(client.data.sub, payload.userId, payload.channelId);
      if (!kicked)
      {
        throw new WsException({
          error: EVENT.KICK_USER,
          message: 'Cannot kick user',
        });
      }
      const channel = await this.channelService.getChannelById(parseInt(payload.channelId));
      const sockets = this.getConnectedUsers(client.data.sub);
      sockets.forEach((s) => {
        this.server.to(s.id).emit(EVENT.SET_ADMIN, channel)
      });
      this.sendChannels(client.data.sub);
    } catch (err) {
      throw new WsException({
        error: EVENT.KICK_USER,
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

  @SubscribeMessage(EVENT.CHANNEL_JOIN)
  async joinChannel(client: Socket, payload: any) {
    try
    {
      let ch ;
      const channel = await this.channelService.getChannelById(payload.channelId);
      if (!channel || channel.type === ChannelType.CONVERSATION)
      {
        throw new WsException({
          error: EVENT.CHANNEL_JOIN,
          message: 'Channel does not exist',
        });
      }
      if (channel.visiblity === Visiblity.PRIVATE || channel.visiblity === Visiblity.PROTECTED )
      ch = await this.channelService.JoinChannel(client.data.sub, payload.channelId, payload.password);
      else
      ch = await this.channelService.JoinChannel(client.data.sub, payload.channelId);
      if (!ch)
      {
        throw new WsException({
          error: EVENT.CHANNEL_JOIN,
          message: 'Cannot join channel',
        });
      }
      let sockets = this.getConnectedUsers(client.data.sub);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.join(payload.channelId.toString());
        this.server.to(s.id).emit(EVENT.CHANNEL_JOIN, channel);
      }
    
    )}
    catch (err)
    {
      throw new WsException({
        error: EVENT.CHANNEL_JOIN,
        message: err.message,
      });
    }
  }
    

  @SubscribeMessage(EVENT.CHANNEL_CREATE)
  async createChannel(client: Socket, payload: ChannelDto) {
    // this.validatePayload(payload);
    try {
      const channel = await this.channelService.makeChannel(client.data.sub, payload);
      if (!channel)
      {
        throw new WsException({
          error: EVENT.CHANNEL_CREATE,
          message: 'Cannot create channel',
        });
      }
      const channelTosend = await this.channelService.getChannelById(channel.id);
      let sockets = this.getConnectedUsers(client.data.sub);
      payload.members.forEach((m) => {
        if (!this.chatService.isBlocked(client.data.sub, m))
          sockets = sockets.concat(this.getConnectedUsers(m));
      })
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.join(channel.id.toString());
        this.server.to(s.id).emit(EVENT.CHANNEL_CREATE, channelTosend);
      });
      this.sendChannels(client.data.sub);
    } 
    catch (error) {
      client.emit(EVENT.ERROR, error.message);
      throw new WsException({
        error: EVENT.ERROR,
        message: error.message,
      });
    }
  }

  @SubscribeMessage(EVENT.CHANNEL_UPDATE)
  async updateChannel(client: Socket, payload: ChannelDto) {
    // this.validatePayload(payload);
    try {
      const channel = await this.channelService.updateChannel(client.data.sub, payload);
      if (!channel)
      {
        throw new WsException({
          error: EVENT.CHANNEL_UPDATE,
          message: 'Cannot create channel',
        });
      }
      const channelTosend = await this.channelService.getChannelById(channel.id);
      let sockets = this.getConnectedUsers(client.data.sub);
      payload.members.forEach((m) => {
        if (!this.chatService.isBlocked(client.data.sub, m))
          sockets = sockets.concat(this.getConnectedUsers(m));
      })
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.join(channel.id.toString());
        this.server.to(s.id).emit(EVENT.CHANNEL_UPDATE, channelTosend);
      });
      this.sendChannels(client.data.sub);
    } 
    catch (error) {
      client.emit(EVENT.ERROR, error.message);
      throw new WsException({
        error: EVENT.ERROR,
        message: error.message,
      });
    }
  }

  @SubscribeMessage(EVENT.GET_CHANNELS)
  async getChannels(client: Socket, payload: any): Promise<void> {
    try {
      const channels = await this.channelService.getChannelsByUserId(client.data.sub);
      client.emit(EVENT.GET_CHANNELS, channels);
    } catch (err) {
      throw new WsException({
        error: EVENT.GET_CHANNELS,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.GET_ARCHIVED_CHANNELS)
  async getArchivedChannels(client: Socket, payload: any): Promise<void> {
    try {
      const channels = await this.channelService.getArchivedChannelsByUserId(client.data.sub);
      client.emit(EVENT.GET_ARCHIVED_CHANNELS, channels);
    } catch (err) {
      throw new WsException({
        error: EVENT.GET_ARCHIVED_CHANNELS,
        message: err.message,
      });
    }
  }
  
  
  @SubscribeMessage(EVENT.CHANNEL_SEARCH)
  async findRoom(client: Socket, payload: any) {
    try {
      const rooms = await this.channelService.findChannelsByName(
        client.data.sub,
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
        client.data.sub,
        payload.channelId,
      );
      const channels = await this.channelService.getChannelsByUserId(client.data.sub);
      const sockets = this.getConnectedUsers(client.data.sub);
      sockets.forEach((s) => {
        s.leave(payload.channelId);
        this.server.to(s.id).emit(EVENT.CHANNEL_LEAVE, channels)
      });
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
        parseInt(client.data.sub),
        parseInt(payload.userId),
        parseInt(payload.channelId),
        );
        const channel = await this.channelService.getChannelById(parseInt(payload.channelId));
        const sockets = this.getConnectedUsers(client.data.sub);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.SET_ADMIN, channel)
        });
        this.sendChannels(client.data.sub);
      } catch (err) {
        throw new WsException({
          error: EVENT.SET_ADMIN,
          message: err.message,
        });
      }
  }

  @SubscribeMessage(EVENT.UNSET_ADMIN)
  async unsetAdmin(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.setAsAdmin(
        1,
        parseInt(payload.userId),
        parseInt(payload.channelId),
        );
      const channel = await this.channelService.getChannelById(parseInt(payload.channelId));
        // client.emit(EVENT.SET_ADMIN, channel);
        const sockets = this.getConnectedUsers(client.data.sub);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.SET_ADMIN, channel)
        });
        this.sendChannels(client.data.sub);
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
      const ru = await this.channelService.banUser(
        parseInt(client.data.sub),
        parseInt(payload.userId),
        parseInt(payload.channelId),
        );
        const ch = await this.channelService.getChannelById(
          parseInt(payload.channelId),
          );
        client.emit(EVENT.SET_ADMIN, ch);
        const sockets = this.getConnectedUsers(client.data.sub);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.SET_ADMIN, ch)
        });
        this.sendChannels(client.data.sub);
      } catch (err) {
        throw new WsException({
          error: EVENT.BAN_FROM_CHANNEL,
          message: err.message,
        });
      }
    }

  @SubscribeMessage(EVENT.UNBAN_FROM_CHANNEL)
  async UnbanFromChannel(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.unbanUser(
        parseInt(client.data.sub),
        parseInt(payload.userId),
        parseInt(payload.channelId),
        );
        const ch = await this.channelService.getChannelById(
          parseInt(payload.channelId),
          );
        client.emit(EVENT.SET_ADMIN, ch);
        const sockets = this.getConnectedUsers(client.data.sub);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.BAN_FROM_CHANNEL, ru)
        });
        this.sendChannels(client.data.sub);
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
        client.data.sub,
        payload.channelId,
        payload.userId,
        );
        const sockets = this.getConnectedUsers(client.data.sub);
        sockets.forEach((s) => {
          this.server.to(s.id).emit(EVENT.REMOVE_CHANNEL_MEMBER, ru)
        });
        this.sendChannels(client.data.sub);
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
        parseInt(dmId), client.data.sub
        );
      } catch (err) {
        throw new WsException({
          error: EVENT.GET_DM_MSSGS,
          message: err.message,
        });
      }
    }

  @SubscribeMessage(EVENT.CHANNEL_DELETE)
  async deleteChannel(client: Socket, payload: any) {
    try {
        await this.channelService.deleteChannel(
              parseInt(payload.channelId), client.data.sub
        );
        const sockets = this.getConnectedUsers(client.data.sub);
        const channels = await this.channelService.getChannelsByUserId(
          client.data.sub
          );
        sockets.forEach((s) => {
          s.leave(payload.channelId);
          this.server.to(s.id).emit(EVENT.CHANNEL_DELETE, channels)
        });
        this.sendChannels(client.data.sub);
      } catch (err) {
        throw new WsException({
          error: EVENT.CHANNEL_DELETE,
          message: err.message,
        });
      }
    }

  @SubscribeMessage(EVENT.PIN_CHANNEL)
  async pinChannel(client: Socket, payload : any) { // to do userId could be get from backend directly ...
    try {
      const chMember = await this.channelService.pinChannel(
        parseInt(client.data.sub), parseInt(payload.channelId)
        );
        client.emit(EVENT.GET_CH_MEMBER, chMember);
        const sockets = this.getConnectedUsers(client.data.sub);
      } catch (err) {
        throw new WsException({
          error: EVENT.PIN_CHANNEL,
          message: err.message,
        });
      }
    }
        
  @SubscribeMessage(EVENT.UNPIN_CHANNEL)
  async unpinChannel(client: Socket, payload: any) {
    try {
      const chMember = await this.channelService.unpinChannel(
        parseInt(client.data.sub),
        parseInt(payload.channelId)
        );
        client.emit(EVENT.GET_CH_MEMBER, chMember);
      } catch (err) {
        throw new WsException({
          error: EVENT.UNPIN_CHANNEL,
          message: err.message,
        });
      }
    }

  @SubscribeMessage(EVENT.MUTE_CHANNEL)
  async muteChannel(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.muteChannel(
        parseInt(client.data.sub),
        parseInt(payload.channelId)
        );
      } catch (err) {
        throw new WsException({
          error: EVENT.MUTE_CHANNEL,
          message: err.message,
        });
      }
  }

  @SubscribeMessage(EVENT.UNMUTE_CHANNEL)
  async unmuteChannel(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.unmuteChannel(
        parseInt(client.data.sub),
        parseInt(payload.channelId)
        );
      } catch (err) {
        throw new WsException({
          error: EVENT.UNMUTE_CHANNEL,
          message: err.message,
        });
      }
  }

  @SubscribeMessage(EVENT.ARCHIVE_CHANNEL)
  async archiveChannel(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.archiveChannel(
        parseInt(client.data.sub),
        parseInt(payload.channelId)
        );
    } catch (err) {
      throw new WsException({
        error: EVENT.ARCHIVE_CHANNEL,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.UNARCHIVE_CHANNEL)
  async unarchiveChannel(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.unarchiveChannel(
        parseInt(client.data.sub),
        parseInt(payload.channelId)
        );
    } catch (err) {
      throw new WsException({
        error: EVENT.ARCHIVE_CHANNEL,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.MUTE_USER)
  async muteUser(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.muteUser(
        parseInt(client.data.sub),
        parseInt(payload.userId),
        parseInt(payload.channelId),
        );
      const ch = await this.channelService.getChannelById(
        parseInt(payload.channelId),
        );
      client.emit(EVENT.SET_ADMIN, ch);
    } catch (err) {
      throw new WsException({
        error: EVENT.MUTE_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.UNMUTE_USER)
  async unmuteUser(client: Socket, payload: any) {
    try {
      const channel = await this.channelService.unmuteUser(
        parseInt(client.data.sub),
        parseInt(payload.userId),
        parseInt(payload.channelId),
        );
      const ch = await this.channelService.getChannelById(
          parseInt(payload.channelId),
          );
        client.emit(EVENT.SET_ADMIN, ch);
    } catch (err) {
      throw new WsException({
        error: EVENT.MUTE_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.PIN_MESSAGE)
  async pinMessage(client: Socket, payload: any) {
    try {
      const message = await this.messageService.pinMessage(
        parseInt(payload.messageId),
        parseInt(client.data.sub),
        );
      const messages = await this.messageService.getMessagesByChannelId(
        parseInt(payload.channelId),
        parseInt(client.data.sub),
        );
      client.emit(EVENT.GET_CH_MSSGS, messages);
      const pinnedMessages = await this.messageService.getPinnedMessages(
        parseInt(payload.channelId),
        parseInt(client.data.sub),
        );  
      client.emit(EVENT.GET_PINNED_MESSAGES, pinnedMessages);
    } catch (err) {
      throw new WsException({
        error: EVENT.PIN_MESSAGE,
        message: err.message,
      });
    }
  }
  
  @SubscribeMessage(EVENT.UNPIN_MESSAGE)
  async UnpinMessage(client: Socket, payload: any) {
    try {
      const message = await this.messageService.UnpinMessage(
        parseInt(payload.messageId),
        parseInt(client.data.sub),
        );
        const messages = await this.messageService.getMessagesByChannelId(
          parseInt(payload.channelId),
          parseInt(client.data.sub),
          );
        client.emit(EVENT.GET_CH_MSSGS, messages);
        const pinnedMessages = await this.messageService.getPinnedMessages(
          parseInt(payload.channelId),
          parseInt(client.data.sub),
          );  
        client.emit(EVENT.GET_PINNED_MESSAGES, pinnedMessages);
    } catch (err) {
      throw new WsException({
        error: EVENT.PIN_MESSAGE,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.GET_PINNED_MESSAGES)
  async getPinnedMessages(client: Socket, payload: any) {
    try {
      const messages = await this.messageService.getPinnedMessages(
        parseInt(payload.channelId),
        parseInt(client.data.sub),
        );
        client.emit(EVENT.GET_PINNED_MESSAGES, messages);
    } catch (err) {
      throw new WsException({
        error: EVENT.GET_PINNED_MESSAGES,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EVENT.MESSAGE_DELETE)
  async deleteMessage(client: Socket, payload: any) {
    try {
      const message = await this.messageService.deleteMessage(
        parseInt(client.data.sub),
        parseInt(payload.messageId),
        );
      const ch = await this.channelService.getChannelById(

          parseInt(payload.channelId),
          );
        client.emit(EVENT.SET_ADMIN, ch);
    } catch (err) {
      throw new WsException({
        error: EVENT.MESSAGE_DELETE,
        message: err.message,
      });
    }
  }


   @SubscribeMessage(EVENT.MARK_UNREAD)
  async markUnread(client: Socket, payload: any) {
    try {
      const updated = await this.channelService.markUnread(
        parseInt(client.data.sub),
        parseInt(payload.channelId),
        );
    } catch (err) {
      throw new WsException({
        error: EVENT.MARK_UNREAD,
        message: err.message,
      });
    }
  }

   @SubscribeMessage(EVENT.MARK_READ)
  async markRead(client: Socket, payload: any) {
    try {
      const updated = await this.channelService.markRead(
        parseInt(client.data.sub),
        parseInt(payload.channelId),
        );
    } catch (err) {
      throw new WsException({
        error: EVENT.MARK_UNREAD,
        message: err.message,
      });
    }
  }


        

/* -------------------------------------- Helper functions -------------------------------------*/

  async joinRoom(client: Socket, payload: any) {
    try {
      const ru = await this.channelService.JoinChannel(
        client.data.sub,
        payload.channelId,
        payload.password,
      );
      const sockets = this.getConnectedUsers(client.data.sub);
      sockets.forEach((s) => {
        s.join(payload.channelId);
        this.server.to(s.id).emit(EVENT.CHANNEL_JOIN, ru)
      });      
      this.sendChannels(client.data.sub);
      // this.sendChannelToMembers(client.data.sub, payload.channelId, ru);
    } catch (err) {
      throw new WsException({
        error: EVENT.CHANNEL_JOIN,
        message: err.message,
      });
    }
  }

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
      // this.userService.updateUserStatus(client.data.sub, UserStatus.ONLINE);
      client.emit("connecte_user", true);
      return data;
    }
    catch (err)
    {
      throw new WsException({
        error: "Authentication failed",
        message: err.message,
      });
    }
}

  private async joinChannels(client)
  {
    const channels = await this.channelService.getChannelsByUserId(client.data.sub);
    channels.forEach((channel) => {
      client.join(channel.id);
    });
  }

  //get realtime channels when added to a channel or when connected

  private async sendChannelsToClient(client: Socket) {
    const channels = await this.channelService.getChannelsByUserId(client.data.sub);
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
      if (user.data.sub === id)
        connectedUsers.push(user);
    });
    return connectedUsers;
  }

  private async sendChannels(userId: number)
  {
    const sockets = this.getConnectedUsers(userId);
    const channels = await this.channelService.getChannelsByUserId(userId);
    for (const socket of sockets) {
      this.server.to(socket.id).emit(EVENT.GET_CHANNELS, channels);
    }
  }
}




