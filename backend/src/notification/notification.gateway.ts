import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'notification', cors: true, origins: '*' })
export class NotificationGateway {
  @WebSocketServer() server;
  clients_map = new Map<string, string>();

  onModuleInit() {
    this.server.on('connect', (socket) => {
      const clientId = socket.handshake.query.clientId;
      this.clients_map.set(clientId, socket.id);
      console.log(this.clients_map);
    });
  }
}
