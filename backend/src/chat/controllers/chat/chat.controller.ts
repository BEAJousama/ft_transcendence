import { Controller } from '@nestjs/common';
import { ChatService } from 'src/chat/services/chat/chat.service';

@Controller('chat')
// @UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}
  // To do : Not sure if i add controllers to handle group operations too
}
