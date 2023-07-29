import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from 'src/chat/services/message/message.service';

/* Here we have controllers to do the following through HTTP requests :

    1 - get Messages of a room based on the roomId
    2 - delete a message
    3 - edit a message
    4 - some other stuff ...
*/
// @UseGuards(new JwtAuthGuard())
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
  // @Post('delete/:messageId')
  // async deleteMessage(@Req() req: Request, payload: any) {
  //   try {
  //     return await this.messageService.deleteMessage(
  //       parseInt(req.params.messageId),
  //       req.user.id,
  //     );
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //   }
  // }
}
