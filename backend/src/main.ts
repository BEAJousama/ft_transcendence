import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthGuard } from './auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

// global-header.middleware.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      // origin: 'http://localhost:5000',
      // origin: '*',
      // origin: 'http://10.12.3.14:5000',
      origin: true,
      credentials: true,
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.setGlobalPrefix('/api');

  const reflector = app.get(Reflector);
  const jwt = app.get(JwtService);
  app.useGlobalGuards(new AuthGuard(reflector, jwt));
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('ft_transcendence API')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth()
    // .addBearerAuth('Authorization', 'header', 'basic')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
