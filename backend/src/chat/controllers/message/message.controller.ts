import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from 'src/chat/services/message/message.service';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}
  @Get(':channelId/:userId')
  async getMessages(@Req() req: Request) {
    try {
      const messages = await this.messageService.getMessagesByChannelId(
        parseInt(req.params.channelId),
        parseInt(req.params.userId),
      );
      return messages;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
