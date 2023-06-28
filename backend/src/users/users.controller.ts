import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  AddFriendsDto,
  BlockUserDto,
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
import { Public } from 'src/public.decorator';
import { assignAchievementsDto } from './dto/achievements.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @FindAllDoc()
  async findAll(@Query('fullname') fullname: string) {
    try {
      return this.usersService.findAllUsers(fullname);
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

  // @Post('achievements')
  // @FindAllDoc()
  // async assignAchievements(@Body() body: assignAchievementsDto) {
  //   try {
  //     return await this.usersService.assignAchievements(
  //       body.userId,
  //       body.achievementId,
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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
  @FindFriendRequsetsDoc()
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

  @Get(':id/friend-request')
  @FindFriendReqDoc()
  async findFriendRequest(
    @Query('senderId') senderId: number,
    @Query('receiverId') receiverId: number,
  ) {
    try {
      const friend = await this.usersService.getFriendRequest({
        senderId,
        receiverId,
      });

      if (!friend) throw 'No Matches Found !!!!!';
      return friend;
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
      const friendRequest = await this.usersService.sendFriendRequest(body);
      if (!friendRequest) throw 'No Matches Found !!!!!';
      return friendRequest;
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }

  @Delete('remove-friend/:id')
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

  @Get('accept-friend/:id')
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
  async updateOne(@Body() body: UpdateUserDto, @Param('id') id: string) {
    try {
      return this.usersService.updateUser(body, parseInt(id));
    } catch (error) {
      return error;
    }
  }

  @Delete(':id')
  @DeleteDoc()
  async deleteOne(@Param('id') id: string) {
    try {
      return this.usersService.deleteUser(parseInt(id));
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
