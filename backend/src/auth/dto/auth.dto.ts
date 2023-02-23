import { Length, IsEmail } from 'class-validator';

export class SigninDto {
  @IsEmail()
  email: string;
  @Length(8, 16)
  password: string;
}

export class SignupDto {
  @IsEmail()
  email: string;
  @Length(8, 16)
  password: string;
  @Length(1)
  name: string;
  @Length(1)
  username: string;
}
