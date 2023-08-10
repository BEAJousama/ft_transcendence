import NotificationService from 'src/notification/notification.service';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ namespace: 'notification', cors: true, origins: '*' })
export class NotificationGateway {
  @WebSocketServer() server;
  clients_map = new Map<string, string>();

  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  private async verifyClient(client) {
    let token: string = client.handshake.auth.token as string;
    if (token.search('Bearer') !== -1) token = token.split(' ')[1];
    try {
      const data = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      client.data = data;
      return data;
    } catch (err) {
      throw new WsException({
        error: 'Authentication failed',
        message: err.message,
      });
    }
  }

  onModuleInit() {
    this.server.on('connect', async (socket) => {
      const clientId = (await this.verifyClient(socket)).sub.toString();
      this.clients_map.delete(clientId);
      this.clients_map.set(clientId, socket.id);
    });
    this.server.on('disconnect', async (socket) => {
      const clientId = (await this.verifyClient(socket)).sub.toString();
      this.clients_map.delete(clientId);
    });
  }
}
