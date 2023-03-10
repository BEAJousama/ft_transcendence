import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({
    description: 'The id of the user who is blocking another user',
  })
  blockerId: number;
  @ApiProperty({
    description: 'The id of the user who is being blocked by another user',
  })
  blockingId: number;
}

export class UnblockUserDto {
  @ApiProperty({
    description: 'The id of the user who is blocking another user',
  })
  blockerId: number;
  @ApiProperty({
    description: 'The id of the user who is being blocked by another user',
  })
  blockingId: number;
}

export class GetBlockedUsersDto {
  @ApiProperty({
    description: 'The id of the user who is blocking another user',
  })
  blockerId: number;
}
