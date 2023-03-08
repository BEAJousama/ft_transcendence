import { Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
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
  async findFriends(@Param('id') id: string) {
    try {
      // get user friends  ?????
    } catch (error) {
      return {
        message: 'No Matches Found !!!!!',
      };
    }
  }
  @Post(':id')
  async updateOne(@Param('id') id: string, @Req() req: Request) {
    const { data } = req.body;
    return this.usersService.updateUser(parseInt(id), data);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.usersService.deleteUser(parseInt(id));
  }
}
