import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddFriendsDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
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
  senderId: number;
}

export class DeclineFriendRequestDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
  senderId: number;
}

export class GetFriendsDto {
  @ApiProperty({
    description: 'The id of the user who is adding another user',
  })
  @IsNotEmpty()
  @IsNumber()
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
