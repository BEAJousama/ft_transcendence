import {
  ExecutionContext,
  Injectable,
  CanActivate,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      handler,
      controller,
    ]);

    if (isPublic) return true;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  // private extractTokenFromHeader(req: Request) {
  private extractTokenFromHeader(req: Request) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(';');

    // Assuming the access token is stored in a cookie named "access_token"
    const tokenCookie = cookieArray.find((cookie) =>
      cookie.trim().startsWith('access_token='),
    );

    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      return token.trim();
    } else {
      return undefined; // If the access token cookie is not found
    }
  }
}
