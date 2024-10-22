import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  
  // Serve static files
  const staticPath = join(__dirname, '..', 'client', 'src');
  app.use(express.static(staticPath, {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  // Configure CORS to allow HTTP
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3000',
      'http://gitlab.com',
      'http://polytechnique-montr-al.gitlab.io',
      'http://polytechnique-montr-al.gitlab.io/log2990/20243/equipe-201/LOG2990-201',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    credentials: true,
    maxAge: 3600,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Cadriciel Serveur')
    .setDescription('Serveur du projet de base pour le cours de LOG2990')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // API routes handler - removed HTTPS redirect
  app.use('/api/*', (req, res, next) => {
    next();
  });

  // Client-side routing handler
  app.use('*', (req, res) => {
    try {
      const indexPath = join(staticPath, 'index.html');
      res.sendFile(indexPath, {
        headers: {
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
};

bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

