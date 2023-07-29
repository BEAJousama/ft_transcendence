import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  receiverId: number;
}
