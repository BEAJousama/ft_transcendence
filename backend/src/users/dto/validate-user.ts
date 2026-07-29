import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { JwtService } from '@nestjs/jwt';

export function MatchesUserId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'matchesUserId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          const request = args.object as any;
          const authenticatedUserId = request?.context?.user?.sub;

          if (!authenticatedUserId) {
            return false;
          }

          return value === authenticatedUserId;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} does not match the user's ID from the access token.`;
        },
      },
    });
  };
}
