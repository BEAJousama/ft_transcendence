import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Channel } from '@prisma/client';
import { Request } from 'express';
import { MessageService } from 'src/chat/services/message/message.service';
import { DmService } from 'src/chat/services/dm/dm.service';
import { ChannelService } from 'src/chat/services/channel/channel.service';
import { ChatService } from 'src/chat/services/chat/chat.service';

@Controller('chat')
// @UseGuards(AuthGuard('jwt'))
export class ChatController {

    constructor(private chatService: ChatService)
    {}
    // To do : Not sure if i add controllers to handle group operations too
}