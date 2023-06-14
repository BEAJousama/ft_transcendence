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
export class PongGateway {}
