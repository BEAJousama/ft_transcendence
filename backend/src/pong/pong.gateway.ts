import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'net';
import { PongService } from './pong.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5000',
  },
})
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
    console.log('client joined');
    client.emit('joined', 'joined');
  }

  @SubscribeMessage('leave-queue')
  handleLeave(@ConnectedSocket() client: Socket) {
    console.log('client left');
    client.emit('left', 'left');
  }
}
