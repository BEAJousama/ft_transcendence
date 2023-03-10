import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ProfileDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Returns the user profile',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function CallbackDoc() {
  return applyDecorators(
    ApiResponse({
      status: 302,
      description: `
            if the user is not logged in, redirect to 42 intranet login page
            after login,
            if the user unauthorize, redirect to frontend unauthorized page
            if the user have 2FA activated, redirect to frontend TFA page (with the tfaToken in Cookies)
            otherwise, redirect to frontend home page (with the accessToken in Cookies)
        `,
    }),
  );
}

export function TurnOnDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'message: "TFA activated"',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function TurnOffDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'message: "TFA deactivated"',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function VerifyDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOkResponse({
      description:
        "Returns true and set's access token in cookie if code is valid otherwise returns false",
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function LogoutDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'message: "Logout successful"',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
