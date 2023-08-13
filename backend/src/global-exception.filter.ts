import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = 401;
    let message = 'Unauthorized';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
    }

    if (exception instanceof InternalServerErrorException) {
      response.status(statusCode).json({
        statusCode,
        message,
      });
    }

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
