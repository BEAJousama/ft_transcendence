import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WebSocketDisconnect,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Invitation } from './interfaces/index';
import { Socket } from 'socket.io';
import { PongService } from './pong.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ namespace: 'pong', cors: true, origins: '*' })
export class PongGateway {
  constructor(
    private readonly pongService: PongService,
    private usersService: UsersService,
  ) {}
  @WebSocketServer() server;

  // constructor(private usersService: UsersService) {}

  onModuleInit() {
    this.server.on('connect', (socket) => {
      const clientId = socket.handshake.query.clientId;
      this.usersService.changeUserStatus(parseInt(clientId), 'ONLINE');
      console.log('connected', clientId);
      socket.on('disconnect', () => {
        this.usersService.changeUserStatus(parseInt(clientId), 'OFFLINE');
        console.log('disconnect', clientId);
      });
    });
  }

  @SubscribeMessage('invite-friend')
  inviteFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() info: Invitation,
  ) {
    this.pongService.inviteFriend(info.inviterId, info.invitedFriendId, client);
  }

  @SubscribeMessage('accept-invitation')
  acceptInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody() info: Invitation,
  ) {
    this.pongService.acceptInvitation(info.invitedFriendId, client);
  }

  @SubscribeMessage('play-with-friend')
  playWithFriend(@ConnectedSocket() client: Socket) {
    // this.pongService.playWithFriend(client);
    client.emit('init-game');
  }

  @SubscribeMessage('play-with-ai')
  playWithAi(@ConnectedSocket() client: Socket) {
    this.pongService.playWithAI(client);
    client.emit('init-game');
  }

  @SubscribeMessage('join-queue')
  handleJoin(@ConnectedSocket() client: Socket) {
    this.pongService.joinQueue(client);
  }
  @SubscribeMessage('leave-queue')
  handleLeave(@ConnectedSocket() client: Socket) {
    this.pongService.leaveQueue(client);
  }

  @SubscribeMessage('update')
  update(@ConnectedSocket() client: Socket, @MessageBody() info) {
    try {
      const data = this.pongService.update(info);
      if (data) {
        client.emit('update', data.ball);
        client.emit('update-player-a', {
          id: data.playerA.id,
          x: data.playerA.x,
          y: data.playerA.y,
          score: data.playerA.score,
          width: data.playerA.width,
          height: data.playerA.height,
        });
        client.emit('update-player-b', {
          id: data.playerB.id,
          x: data.playerB.x,
          y: data.playerB.y,
          score: data.playerB.score,
          width: data.playerB.width,
          height: data.playerB.height,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  @SubscribeMessage('keyPressed')
  keyPressed(@MessageBody() info) {
    this.pongService.keyPressed(info);
  }
  @SubscribeMessage('keyReleased')
  keyReleased(@MessageBody() info) {
    this.pongService.keyReleased(info);
  }
}
