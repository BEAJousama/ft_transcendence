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

          // Replace 'accessToken' with the actual name of the access token cookie
          const accessToken = request?.context?.cookies?.access_token;
          const jwtService: JwtService = new JwtService({
            secret: process.env.JWT_SECRET,
          }); // Initialize your JWT service

          if (!accessToken) {
            return false; // Access token not found
          }

          // Uncomment and modify the following lines once you have your JWT service implemented
          try {
            const decodedToken = await jwtService.verifyAsync(accessToken); // Verify the token
            const accessTokenUserId = decodedToken.sub;
            // Assuming your user ID is a string or number
            return value === accessTokenUserId;
          } catch (error) {
            return false; // Token verification failed
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} does not match the user's ID from the access token.`;
        },
      },
    });
  };
}
