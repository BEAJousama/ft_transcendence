import { IsNotEmpty, IsNumber } from 'class-validator';
import { Socket } from 'socket.io';

export class Invitation {
  @IsNotEmpty()
  @IsNumber()
  inviterId: number;
  inviterSocket?: Socket;
  @IsNotEmpty()
  @IsNumber()
  invitedFriendId: number;
  invitedFriendSocket?: Socket;
  timestamp: number;
  gameMode: string;
  powerUps: string;
}

export class UpdateDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
