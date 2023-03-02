import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User } from '@prisma/client';
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

  @Post(':id')
  async updateOne(id: number, data: User) {
    return this.usersService.updateUser(id, data);
  }

  @Post()
  async createOne(data: User) {
    return this.usersService.createUser(data);
  }

  @Delete(':id')
  async deleteOne(id: number) {
    return this.usersService.deleteUser(id);
  }
}
