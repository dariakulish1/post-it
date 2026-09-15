import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'https://post-l8qoh245w-darias-projects-91f8a453.vercel.app',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 4000;

  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on port ${port}`);
}
await bootstrap();
