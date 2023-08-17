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
          const usernameRegex = /^[a-zA-Z0-9_-]+$/; // Including hyphen in the character set
          const isValidLength = value?.length >= 3 && value?.length <= 20;
          const isValidCharacters = usernameRegex.test(value);
          return isValidLength && isValidCharacters;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 3 and 20 characters and contain only letters, numbers, hyphens, and underscores.`;
        },
      },
    });
  };
}

export function IsFullname(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFullname',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Modify this regex according to your specific requirements for a full name
          const fullnameRegex = /^[a-zA-Z\s]+$/;
          const isValidLength = value?.length >= 3 && value?.length <= 50;
          const isValidFormat = fullnameRegex.test(value);
          return isValidLength && isValidFormat;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 3 and 50 characters and contain only letters, spaces, hyphens, and apostrophes.`;
        },
      },
    });
  };
}

export class SignUpDto {
  @IsNotEmpty()
  @IsFullname({
    message:
      'Full Name must be between 3 and 20 characters and can contain only letters, numbers, and underscores',
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
