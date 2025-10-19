import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

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
  console.log(`process.env.PORT : ${process.env.PORT}`);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(port);
}
bootstrap();
