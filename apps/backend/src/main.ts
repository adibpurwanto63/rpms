import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function createNestServer(expressInstance: express.Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: true, // allow any origin in Vercel environment
    credentials: true,
  });

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

  await app.init();
  return app;
}

if (!process.env.VERCEL) {
  createNestServer(server).then(app => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`🚀 RPMS Backend running on http://localhost:${port}`);
      console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    });
  });
}

let cachedApp: any;
export default async (req: any, res: any) => {
  if (!cachedApp) {
    cachedApp = await createNestServer(server);
  }
  server(req, res);
};
