import { Socket } from 'socket.io';

export interface Invitation {
  inviterId: number;
  inviterSocket?: Socket;
  invitedFriendId: number;
  invitedFriendSocket?: Socket;
  timestamp: number;
  bit: string;
  powerUps: string;
}
