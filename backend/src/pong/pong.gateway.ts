import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'net';
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
  @SubscribeMessage('join-queue')
  handleJoin(@ConnectedSocket() client: Socket) {
    // console.log('client joined');
    client.emit('joined', 'joined');
  }
  @SubscribeMessage('leave-queue')
  handleLeave(@ConnectedSocket() client: Socket) {
    // console.log('client left');
    client.emit('left', 'left');
  }
  @SubscribeMessage('init')
  init(@ConnectedSocket() client: Socket, @MessageBody() info) {
    console.log(info);
    const data = this.pongService.init(info);
    client.emit('init', data);
  }
  @SubscribeMessage('update')
  update(@ConnectedSocket() client: Socket, @MessageBody() info) {
    const data = this.pongService.update();
    client.emit('update', data);
  }
  @SubscribeMessage('keyPressed')
  keyPressed(@ConnectedSocket() client: Socket, @MessageBody() info) {
    console.log('hello');
    const data = this.pongService.keyPressed(info);
    // client.emit('update', data);
  }
  //   @SubscribeMessage('keyReleased')
  //   keyReleased(@ConnectedSocket() client: Socket, @MessageBody() info) {
  //     const data = this.pongService.keyReleased(info);
  //     client.emit('update', data);
  //   }
}
