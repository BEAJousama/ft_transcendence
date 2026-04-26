import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from 'src/chat/services/message/message.service';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}
  @Get(':channelId/:userId')
  async getMessages(
    @Req() req: Request,
    @Query('take') take?: string,
    @Query('before') before?: string,
  ) {
    try {
      const messages = await this.messageService.getMessagesByChannelId(
        parseInt(req.params.channelId),
        parseInt(req.params.userId),
        {
          take: take ? parseInt(take) : undefined,
          before,
        },
      );
      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
