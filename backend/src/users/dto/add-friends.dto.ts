import { ApiProperty } from '@nestjs/swagger';

export class AddFriendsDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  senderId: number;
  @ApiProperty({
    description: 'The id of the user who is being added by another user',
  })
  receiverId: number;
}

export class AcceptFriendRequestDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  senderId: number;
}

export class DeclineFriendRequestDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  senderId: number;
}

export class GetFriendsDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  userId: number;
}

// export class GetFriendRequestsDto {
//     @ApiProperty({
//         description: 'The id of the user who is adding another user',
//     })
//     userId: number;
//     }

// export class GetSentFriendRequestsDto {
//     @ApiProperty({
//         description: 'The id of the user who is adding another user',
//     })
//     userId: number;
//     }
