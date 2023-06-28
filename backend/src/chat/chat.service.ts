import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  createMessage(payload: Message) {
    // this.prisma.message.create({
    // data: {
    //     {} as any,
    // }
    // })
  }
}
