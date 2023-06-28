import NotificationService from 'src/notification/notification.service';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ namespace: 'notification', cors: true, origins: '*' })
export class NotificationGateway {
  @WebSocketServer() server;
  clients_map = new Map<string, string>();

  // constructor(private usersService: UsersService) {}
  onModuleInit() {
    this.server.on('connect', (socket) => {
      const clientId = socket.handshake.query.clientId;
      this.clients_map.set(clientId, socket.id);
      // this.usersService.chnageUserStatus(clientId, 'ONLINE');
    });
    this.server.on('disconnect', (socket) => {
      const clientId = socket.handshake.query.clientId;
      this.clients_map.set(clientId, socket.id);
      // this.usersService.chnageUserStatus(clientId, 'OFFLINE');
    });
  }
}
