import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  
  // Serve static files before setting API prefix
  const staticPath = join(__dirname, '..', 'public', 'src');
  app.use(express.static(staticPath));
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true
  });

  const config = new DocumentBuilder()
    .setTitle('Cadriciel Serveur')
    .setDescription('Serveur du projet de base pour le cours de LOG2990')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // API routes handler
  app.use('/api/*', (req, res, next) => {
    next();
  });

  // Client-side routing handler - serve index.html for all non-API routes
  app.use('*', (req, res) => {
    try {
      const indexPath = join(staticPath, 'index.html');
      res.sendFile(indexPath);
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  await app.listen(process.env.PORT || 3000);
};

bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
});


