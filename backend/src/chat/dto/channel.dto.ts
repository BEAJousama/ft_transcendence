import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChannelDto {
  @IsNumber()
  @IsNotEmpty()
  id?: number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  avatar: string;
  @IsString()
  @IsNotEmpty()
  visibility: string;
  @IsString()
  password?: string;
  @IsString()
  access_pass?: string;
  @IsArray()
  @IsNumber({}, { each: true })
  members?: number[];
  @IsString()
  // @IsNotEmpty()
  type?: string;
}
