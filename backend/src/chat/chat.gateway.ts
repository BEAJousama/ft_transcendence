import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatservice: ChatService) {}

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: Message) {
    this.chatservice.createMessage(payload);
    this.server.emit('message', payload);
  }
}
