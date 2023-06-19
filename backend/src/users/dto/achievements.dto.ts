import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class assignAchievementsDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the user to assign the achievement to',
    example: 123,
  })
  userId: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the achievement to assign',
    example: 456,
  })
  achievementId: number;
}
