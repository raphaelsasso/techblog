import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) return;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();
  isBootstrapped = true;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}
