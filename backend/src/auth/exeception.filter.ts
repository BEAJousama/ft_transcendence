import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { getFrontendUrl } from './frontend-url';

// Sends failed OAuth callbacks back to the frontend instead of leaving the
// popup on an API error page.
@Catch()
export class FourtyTwoFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    response.redirect(getFrontendUrl());
  }
}
