import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  receiverId: number;
}

export class mDto {
  @IsString()
  @IsNotEmpty()
  messageId: string;
  @IsString()
  @IsNotEmpty()
  channelId?: string;
}
