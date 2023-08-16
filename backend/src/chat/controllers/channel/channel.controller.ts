import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Channel } from '@prisma/client';
import { Request } from 'express';
import { ChannelService } from 'src/chat/services/channel/channel.service';

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('')
  async getChats(@Req() req: Request): Promise<Channel[]> {
    try {
      return await this.channelService.getAllChannels((req.user as any).sub);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':userId')
  async getChannels(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<Channel[]> {
    try {
      return await this.channelService.getChannelsByUserId(parseInt(userId));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('archived/:userId')
  async getArchivedChannels(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<Channel[]> {
    try {
      return await this.channelService.getArchivedChannelsByUserId(
        parseInt(userId),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('checkpass')
  async checkPass(@Req() req: Request): Promise<boolean> {
    try {
      return await this.channelService.checkAccessPass(
        req.body.channelId,
        req.body.password,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':userId')
  async getchannelMembers(@Param('userId') userId: string): Promise<any[]> {
    try {
      const channels = await this.channelService.getChannelsByUserId(
        parseInt(userId),
      );
      return channels;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('member/:userId/:channelId')
  async getchannelMember(
    @Param('userId') userId: string,
    @Param('channelId') channelId: string,
  ): Promise<any> {
    try {
      const member =
        await this.channelService.getChannelMemberByUserIdAndChannelId(
          parseInt(userId),
          parseInt(channelId),
        );
      return member;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
