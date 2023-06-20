import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { Request } from 'express';
import { ChannelService } from 'src/chat/services/channel/channel.service';

    /* 
        Here we have controllers to do the following through HTTP requests :
                channel  = Group & Dm;
        1 - get channels based on the userId stored in req.user.id (including dm channels)
        2 - get The members of a channel based on the channelId
        3 - get group channels only based on userId
        4 - get friends list to add to group
        5 - get only searched channels
    */
@Controller('channels')
export class ChannelController 
{

    constructor(private channelService : ChannelService)
    {
    }

    @Get('')
    async getChats(@Req() req: Request): Promise<Channel[]> {
      try {
        return await this.channelService.getAllChannels((req.user as any).sub);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
    }
  
    @Get('channel/:channelId/members')
    async getchannelMembers(
      @Req() req: Request,
      @Param('channelId') channelId: string,
    ): Promise<any[]> {
      try {
        const members = await this.channelService.getChannelMembersByChannelId(
          parseInt(channelId),
        );
        return members;

      } catch (error) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
    }
  
    // @Get('channels')
    // async getchannels(@Req() req: Request): Promise<Channel[]> {
    //   try {
    //     const channels = await this.channelService.getChannelsByUserId(parseInt(req?.user?.id));
    //     if (!channels) {
    //       return [];
    //     }
    //     return channels;
    //   } catch (error) {
    //     throw new HttpException('No channels found', HttpStatus.NOT_FOUND);
    //   }
    // }

    //delete a channel

    //delete a message

    //update a channel

    //add user to channel

    //block user from channel

    //set as admin
}
