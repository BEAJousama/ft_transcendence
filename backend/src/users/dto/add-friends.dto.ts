import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsNotEmpty } from 'class-validator';
import { MatchesUserId } from './validate-user';

export class AddFriendsDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
  @MatchesUserId()
  senderId: number;
  @ApiProperty({
    description: 'The id of the user who is being added by another user',
  })
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;
}

export class AcceptFriendRequestDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
  @MatchesUserId()
  senderId: number;
}

export class DeclineFriendRequestDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
  @MatchesUserId()
  senderId: number;
}

export class GetFriendsDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
  @MatchesUserId()
  userId: number;
}

export class IdDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @MatchesUserId()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
