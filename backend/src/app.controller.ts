import { Controller, Get } from '@nestjs/common';
import { Public } from './public.decorator';

@Controller('health')
export class AppController {
  @Public()
  @Get()
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
