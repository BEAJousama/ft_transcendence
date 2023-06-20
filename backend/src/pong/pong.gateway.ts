import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PongService } from './pong.service';

@WebSocketGateway({ namespace: 'pong', cors: true, origins: '*' })
export class PongGateway {
  constructor(private readonly pongService: PongService) {}
  @WebSocketServer() server;
  onModuleInit() {
    this.server.on('connect', (socket) => {
      console.log('connected');
    });
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
  keyPressed(@ConnectedSocket() client: Socket, @MessageBody() info) {
    this.pongService.keyPressed(client, info);
  }
  @SubscribeMessage('keyReleased')
  keyReleased(@ConnectedSocket() client: Socket, @MessageBody() info) {
    this.pongService.keyReleased(client, info);
  }
}
