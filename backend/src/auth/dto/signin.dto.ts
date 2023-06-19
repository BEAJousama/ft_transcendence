import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'username of user',
  })
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  @ApiProperty({
    description: 'password of user',
  })
  password: string;
}
