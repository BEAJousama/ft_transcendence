import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'The id of the user',
  })
  id: number;
  @ApiProperty({
    description: 'The login of the user',
  })
  login: string;
  @ApiProperty({
    description: 'The username of the user',
  })
  username: string;
  @ApiProperty({
    description: 'The avatar of the user',
  })
  avatar: string;
  @ApiProperty({
    description: 'true if tfa activated otherwise false',
  })
  twoFactorAuth: boolean;
  @ApiProperty({
    description: 'The tfa secret',
  })
  tfaSecret: string;
  @ApiProperty({
    enum: ['ONLINE', 'INGAME', 'OFFLINE'],
    description: 'The status of the user',
  })
  status: string;
  @ApiProperty({
    enum: [
      'BEGINNER',
      'AMATEUR',
      'SEMI_PROFESSIONAL',
      'PROFESSIONAL',
      'WORLD_CLASS',
      'LEGENDARY',
    ],
    description: 'The ladder of the user',
  })
  ladder: string;
  @ApiProperty({
    description: 'The rating of the user',
  })
  rating: number;
  @ApiProperty({})
  createdAt: Date;
  @ApiProperty({})
  updatedAt: Date;
  @ApiProperty({
    description: 'number of wins',
  })
  wins: number;
  @ApiProperty({
    description: 'number of losses',
  })
  losses: number;

  @ApiProperty({
    description: 'email of the user',
  })
  email: string;

  @ApiProperty({
    description: 'fullname of the user',
  })
  fullname: string;

  @ApiProperty({
    description: 'country of the user',
  })
  country: string;

  @ApiProperty({
    description: 'phone of the user',
  })
  phone: string;
}

export class DeleteUserDto {
  @ApiProperty({
    description: 'The id of the user',
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user object to update',
  })
  user: UserDto;
}
