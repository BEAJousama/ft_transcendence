import { IsNotEmpty, IsNumber } from 'class-validator';

export class DmDto {
  channelId?: number;
  @IsNumber()
  @IsNotEmpty()
  senderId?: number;
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;
  name?: string;
  avatar?: string;
}
