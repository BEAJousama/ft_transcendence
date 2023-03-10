import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import {
  AddFriendsDto,
  BlockUserDto,
  GetBlockedUsersDto,
  UnblockUserDto,
  UpdateUserDto,
} from './dto';
import {
  AcceptFriendsDoc,
  AddFriendsDoc,
  BlockUserDoc,
  DeleteDoc,
  FindAllDoc,
  FindOneDoc,
  GetBlockedUsersDoc,
  GetFriendsDoc,
  RemoveFriendsDoc,
  UnblockUserDoc,
  UpdateDoc,
} from './users.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @FindAllDoc()
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @FindOneDoc()
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findUserById(parseInt(id));
      if (!user) throw 'No Matches Found !!!!!';
      return user;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Get(':id/friends')
  @GetFriendsDoc()
  async findFriends(@Param('id') id: string) {
    try {
      const friends = await this.usersService.getFriends(parseInt(id));
      if (!friends) throw 'No Matches Found !!!!!';
      return friends;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Get(':id/friend-requests')
  async findFriendRequests(@Param('id') id: string) {
    try {
      const friends = await this.usersService.getFriendRequests(parseInt(id));
      if (!friends) throw 'No Matches Found !!!!!';
      return friends;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Post('block-user')
  @BlockUserDoc()
  async blockUser(@Body() body: BlockUserDto) {
    try {
      const blockedUser = await this.usersService.blockUser(body);
      if (!blockedUser) throw 'No Matches Found !!!!!';
      return blockedUser;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Post('unblock-user')
  @UnblockUserDoc()
  async unblockUsers(@Body() body: UnblockUserDto) {
    try {
      const blockedUser = await this.usersService.unblockUser(body);
      if (!blockedUser) throw 'No Matches Found !!!!!';
      return blockedUser;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Post('add-friend')
  @AddFriendsDoc()
  async addFriend(@Body() body: AddFriendsDto) {
    try {
      console.log(body);
      const friendRequest = await this.usersService.sendFriendRequest(body);
      if (!friendRequest) throw 'No Matches Found !!!!!';
      return friendRequest;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Post('remove-friend/:id')
  @RemoveFriendsDoc()
  async removeFriend(@Param('id') id: string) {
    try {
      const friendRequest = await this.usersService.declineFriendRequest(
        parseInt(id),
      );
      if (!friendRequest) throw 'No Matches Found !!!!!';
      return friendRequest;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Post('accept-friend/:id')
  @AcceptFriendsDoc()
  async acceptFriend(@Param('id') id: string) {
    try {
      const friendRequest = await this.usersService.acceptFriendRequest(
        parseInt(id),
      );
      if (!friendRequest) throw 'No Matches Found !!!!!';
      return friendRequest;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Get(':id/blocked-users')
  @GetBlockedUsersDoc()
  async findBlockedUsers(@Param('id') id: string) {
    try {
      const blockedUsers = await this.usersService.getBlockedUsers(
        parseInt(id),
      );
      if (!blockedUsers) throw 'No Matches Found !!!!!';
      return blockedUsers;
    } catch {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Post(':id')
  @UpdateDoc()
  async updateOne(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(body);
  }

  @Delete(':id')
  @DeleteDoc()
  async deleteOne(@Param('id') id: string) {
    return this.usersService.deleteUser(parseInt(id));
  }
}
