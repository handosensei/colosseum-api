import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  const whitelist = [
    'http://localhost:3001',
    'https://colosseum-app.vercel.app',
  ];
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: whitelist,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use('/webhooks/cloudflare-stream', bodyParser.raw({ type: 'application/json' }));

  await app.listen(port);
}
bootstrap();
