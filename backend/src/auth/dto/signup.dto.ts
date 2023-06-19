import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const usernameRegex = /^[a-zA-Z0-9_]*$/;
          const isValidLength = value?.length >= 3 && value?.length <= 20;
          const isValidCharacters = usernameRegex.test(value);
          return isValidLength && isValidCharacters;
        },
      },
    });
  };
}
export class UserDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  email: string;
}
export class SignUpDto {
  @IsNotEmpty()
  @IsUsername({
    message:
      'FullName must be between 3 and 20 characters and can contain only letters, numbers, and underscores',
  })
  @ApiProperty({
    description: 'fullname of user',
  })
  fullname: string;
  @IsNotEmpty()
  @IsUsername({
    message:
      'Username must be between 3 and 20 characters and can contain only letters, numbers, and underscores',
  })
  @ApiProperty({
    description: 'username of user',
  })
  username: string;
  @ApiProperty({
    description: 'password of user',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'email of user',
  })
  email: string;
}
