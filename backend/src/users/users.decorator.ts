import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AddFriendsDto,
  BlockUserDto,
  DeleteUserDto,
  UpdateUserDto,
  UserDto,
} from './dto';

export function FindAllDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Returns all users',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function FindOneDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Returns a single user',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function UpdateDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Updates a user',
      type: UpdateUserDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function DeleteDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Deletes a user',
      type: DeleteUserDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function GetFriendsDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Returns all friends of a user',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function BlockUserDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Blocks a user',
      type: BlockUserDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function UnblockUserDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Unblocks a user',
      type: BlockUserDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function AddFriendsDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Adds a friend',
      type: AddFriendsDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function RemoveFriendsDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Removes a friend',
      type: AddFriendsDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function AcceptFriendsDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Removes a friend',
      type: AddFriendsDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function GetBlockedUsersDoc() {
  return applyDecorators(
    ApiOkResponse({
      description: 'Returns all blocked users of a user',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
