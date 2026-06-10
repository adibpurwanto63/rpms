import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Allow all origins (Vercel frontend)
    credentials: true,
  });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('RPMS API')
    .setDescription('Recovered Paper Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 7860;
  console.log(`Database URL configured as: ${process.env.DATABASE_URL ? 'provided by environment' : 'not provided; using configured fallback'}`);
  await app.listen(port);
  console.log(`🚀 RPMS Backend running on port ${port}`);
}
bootstrap();
