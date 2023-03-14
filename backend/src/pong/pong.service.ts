import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';

@Injectable()
export class PongService {
  private readonly queue: Socket[] = [];
}
