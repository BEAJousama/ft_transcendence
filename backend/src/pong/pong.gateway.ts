import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Invitation, UpdateDto } from './interfaces/index';
import { Socket } from 'socket.io';
import { PongService } from './pong.service';
import { Inject } from '@nestjs/common';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ namespace: 'pong', cors: true, origins: '*' })
export class PongGateway {
  constructor(
    private readonly pongService: PongService,
    @Inject(NotificationGateway)
    private notificationGateway: NotificationGateway,
  ) {}
  @WebSocketServer() server;

  @SubscribeMessage('check-for-active-invitations')
  async checkForActiveInvitations(@ConnectedSocket() client: Socket) {
    await this.pongService.checkForActiveInvitations(client);
  }

  @SubscribeMessage('reject-invitation')
  @SubscribeMessage('cancel-invite')
  rejectInvitation(@MessageBody() info) {
    this.pongService.resetInvitation(info.inviterId);
  }

  @SubscribeMessage('invite-friend')
  inviteFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() info: Invitation,
  ) {
    const invitation: Invitation = this.pongService.inviteFriend(info, client);
    const id = this.notificationGateway.clients_map.get(
      info.invitedFriendId.toString(),
    );
    if (invitation && invitation.inviterId && invitation.invitedFriendId) {
      this.notificationGateway.server
        .to(id)
        .emit('check-for-active-invitations', {
          inviterId: invitation.inviterId,
          invitedFriendId: invitation.invitedFriendId,
          gameMode: invitation.gameMode,
          powerUps: invitation.powerUps,
        });
    }
  }

  @SubscribeMessage('accept-invitation')
  acceptInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody() info: Invitation,
  ) {
    this.pongService.acceptInvitation(info.invitedFriendId, client);
  }

  @SubscribeMessage('puase-game')
  pauseGame(@ConnectedSocket() client: Socket, @MessageBody() info: UpdateDto) {
    this.pongService.pauseGame(client, info);
  }

  @SubscribeMessage('resume-game')
  resumeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() info: UpdateDto,
  ) {
    this.pongService.resumeGame(client, info);
  }

  @SubscribeMessage('is-already-in-game')
  isAlreadyInGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() info: UpdateDto,
  ) {
    const isInGame = this.pongService.isAlreadyInGame(client, info);
    client.emit('is-already-in-game', isInGame);
  }

  @SubscribeMessage('leave-game')
  leaveGame(@ConnectedSocket() client: Socket, @MessageBody() info: UpdateDto) {
    this.pongService.leaveGame(client, info);
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
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    info: {
      userId: number;
      gameMode: string;
      powerUps: string;
    },
  ) {
    this.pongService.joinQueue(client, info);
  }
  @SubscribeMessage('leave-queue')
  handleLeave(@ConnectedSocket() client: Socket) {
    this.pongService.leaveQueue(client);
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
