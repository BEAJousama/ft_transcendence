import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async signup(body: SignupDto) {
    try {
      console.log(body);
      const hash = await argon.hash(body.password);
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          password: hash,
          name: body.name,
          username: body.username,
        },
      });
      console.log(user);
      return user;
    } catch (error) {
      return {
        msg: ' error',
      };
    }
  }

  async signin(body: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (user) {
      const valid = await argon.verify(user.password, body.password);
      if (valid) {
        return user;
      }
    }
    return {
      msg: 'Invalid credentials',
    };
  }
}
