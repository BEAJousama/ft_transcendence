import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  @Post()
  createUser(@Body() body: User) {}

  @Get(':id')
  getUserById(@Param('id') id: string) {}
}
