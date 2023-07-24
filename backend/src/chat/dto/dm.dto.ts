import { User } from '@prisma/client';
import { channelmembersI } from '../models/channelMembers.interface';

export class DmDto {
  channelId?: number;
  senderId?: number;
  receiverId: number;
  name?: string;
  avatar?: string;
}
