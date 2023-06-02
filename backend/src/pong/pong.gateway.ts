import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'net';
import { PongService } from './pong.service';

@WebSocketGateway({
  namespace: 'game',
  cors: true,
  origins: '*',
})
export class PongGateway {
  // constructor(private readonly pongService: PongService) {}
  // @WebSocketServer() server;
  // onModuleInit() {
  //   this.server.on('connect', (socket) => {
  //     console.log('connected');
  //   });
  // }
  // @SubscribeMessage('init')
  // init(@ConnectedSocket() client: Socket, @MessageBody() info) {
  //   console.log(info);
  //   const data = this.pongService.initialize(info);
  //   client.emit('init', data);
  // }
  // @SubscribeMessage('update')
  // update(@ConnectedSocket() client: Socket, @MessageBody() info) {
  //   const data = this.pongService.update(info);
  //   client.emit('update', data);
  // }
  // @SubscribeMessage('join-queue')
  // handleJoin(@ConnectedSocket() client: Socket) {
  //   console.log('client joined');
  //   client.emit('joined', 'joined');
  // }
  // @SubscribeMessage('leave-queue')
  // handleLeave(@ConnectedSocket() client: Socket) {
  //   console.log('client left');
  //   client.emit('left', 'left');
  // }
}
