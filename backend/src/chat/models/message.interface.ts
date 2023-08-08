import { Channel, User } from '@prisma/client';

export interface MessageI {
  id: string;
  content: string;
  receiver: Channel;
  sender: User;
  date: Date;
}
