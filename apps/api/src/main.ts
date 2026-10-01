import * as dotenv from 'dotenv';
import { join } from 'path';

// Load root workspace .env
dotenv.config({ path: join(process.cwd(), '../../.env') });
// Fallback to local .env if any
dotenv.config();

// Auto-override URLs for local development (if running .ts files)
if (__filename.endsWith('.ts')) {
  process.env.FRONTEND_URL = 'http://localhost:3003';
  process.env.NEXT_PUBLIC_API_URL = `http://localhost:${process.env.PORT || 3305}`;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3003',
    credentials: true,
  });

  // Apply Global Interceptor & Filter to standardize Response/Error
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Standardize Data Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 8008);
}
bootstrap();
