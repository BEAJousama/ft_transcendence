import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  AddFriendsDto,
  BlockUserDto,
  FindOneParams,
  UnblockUserDto,
  UpdateUserDto,
} from './dto';
import {
  AcceptFriendsDoc,
  AddFriendsDoc,
  BlockUserDoc,
  DeleteDoc,
  FindAllDoc,
  FindFriendReqDoc,
  FindFriendRequsetsDoc,
  FindOneDoc,
  GetBlockedUsersDoc,
  GetFriendsDoc,
  RemoveFriendsDoc,
  UnblockUserDoc,
  UpdateDoc,
} from './users.decorator';
import { UsersService } from './users.service';
import { assignAchievementsDto } from './dto/achievements.dto';
import { Request } from 'express';
import { Public } from 'src/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @FindAllDoc()
  async findAll() {
    try {
      return this.usersService.findAllUsers();
    } catch (error) {
      return null;
    }
  }

  @Get('/stats')
  @Public()
  // @FindAllDoc()
  async findStats() {
    try {
      return this.usersService.findStats();
    } catch (error) {
      return null;
    }
  }

  @Get('achievements')
  @FindAllDoc()
  async getAllAchievements() {
    try {
      return await this.usersService.getAllAchievements();
    } catch (error) {
      return null;
    }
  }

  @Get(':id')
  @FindOneDoc()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.usersService.findUserById(id);
      if (!user) throw new NotFoundException('No Matches Found !!!!!');
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/friends')
  @GetFriendsDoc()
  async findFriends(@Param('id', ParseIntPipe) id: number) {
    try {
      const friends = await this.usersService.getFriends(id);
      if (!friends) throw new NotFoundException('No Matches Found !!!!!');
      return friends;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/friend-requests')
  @FindFriendRequsetsDoc()
  async findFriendRequests(@Param('id', ParseIntPipe) id: number) {
    try {
      const friends = await this.usersService.getFriendRequests(id);
      if (!friends) throw new NotFoundException('No Matches Found !!!!!');
      return friends;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/friend-request')
  @FindFriendReqDoc()
  async findFriendRequest(
    @Query('senderId', ParseIntPipe) senderId: number,
    @Query('receiverId', ParseIntPipe) receiverId: number,
  ) {
    try {
      const friend = await this.usersService.getFriendRequest({
        senderId,
        receiverId,
      });
      if (!friend) throw new NotFoundException('No Matches Found !!!!!');
      return friend;
    } catch (error) {
      throw error;
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
      return null;
    }
  }

  @Post('unblock-user')
  @UnblockUserDoc()
  async unblockUsers(@Body() body: UnblockUserDto) {
    try {
      console.log(body);
      const blockedUser = await this.usersService.unblockUser(body);
      if (!blockedUser) throw 'No Matches Found !!!!!';
      return blockedUser;
    } catch (error) {
      return null;
    }
  }

  @Get('non-blocked-users/:userId')
  @FindAllDoc()
  async findAllNonBlockUsers(@Param('userId', ParseIntPipe) userId: number) {
    try {
      return this.usersService.findAllNonBlockUsers(userId);
    } catch (error) {
      throw error;
    }
  }

  @Post('add-friend')
  @AddFriendsDoc()
  async addFriend(@Body() body: AddFriendsDto) {
    try {
      const friendRequest = await this.usersService.sendFriendRequest(body);
      if (!friendRequest) throw new NotFoundException('No Matches Found !!!!!');
      return friendRequest;
    } catch (error) {
      throw error;
    }
  }

  @Delete('remove-friend/:id')
  @RemoveFriendsDoc()
  async removeFriend(@Param('id', ParseIntPipe) id: number) {
    try {
      const friendRequest = await this.usersService.declineFriendRequest(id);
      if (!friendRequest) throw new NotFoundException('No Matches Found !!!!!');
      return friendRequest;
    } catch (error) {
      throw error;
    }
  }

  @Get('accept-friend/:id')
  @AcceptFriendsDoc()
  async acceptFriend(@Param('id', ParseIntPipe) id: number) {
    try {
      const friendRequest = await this.usersService.acceptFriendRequest(id);
      if (!friendRequest) throw new NotFoundException('No Matches Found !!!!!');
      return friendRequest;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/blocked-users')
  @GetBlockedUsersDoc()
  async findBlockedUsers(@Param('id', ParseIntPipe) id: number) {
    try {
      const blockedUsers = await this.usersService.getBlockedUsers(id);
      if (!blockedUsers) throw 'No Matches Found !!!!!';
      return blockedUsers;
    } catch {
      return null;
    }
  }

  @Get(':id/blocking-users')
  @GetBlockedUsersDoc()
  async findBlockingUsers(@Param('id', ParseIntPipe) id: number) {
    try {
      const blockingUsers = await this.usersService.getBlockingUsers(id);
      if (!blockingUsers) throw new NotFoundException('No Matches Found !!!!!');
      return blockingUsers;
    } catch (error) {
      throw error;
    }
  }

  @Post(':id')
  @UpdateDoc()
  async updateOne(
    @Body() body: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      return this.usersService.updateUser(body, id);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @DeleteDoc()
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.usersService.deleteUser(id);
    } catch (error) {
      throw error;
    }
  }
}
