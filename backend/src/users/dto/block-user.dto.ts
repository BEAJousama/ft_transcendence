import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({
    description: 'The id of the user who is blocking another user',
  })
  @IsNotEmpty()
  @IsNumber()
  blockerId: number;
  @ApiProperty({
    description: 'The id of the user who is being blocked by another user',
  })
  @IsNotEmpty()
  @IsNumber()
  blockingId: number;
}

export class UnblockUserDto {
  @ApiProperty({
    description: 'The id of the user who is blocking another user',
  })
  @IsNotEmpty()
  @IsNumber()
  blockerId: number;
  @ApiProperty({
    description: 'The id of the user who is being blocked by another user',
  })
  @IsNotEmpty()
  @IsNumber()
  blockingId: number;
}

export class GetBlockedUsersDto {
  @ApiProperty({
    description: 'The id of the user who is blocking another user',
  })
  @IsNotEmpty()
  @IsNumber()
  blockerId: number;
}
