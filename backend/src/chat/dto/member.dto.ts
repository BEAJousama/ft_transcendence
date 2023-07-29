import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CommunDto {
  @IsNumber()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  channelId: string;

  @IsString()
  password?: string;

  @IsString()
  banDuration?: string;
}
