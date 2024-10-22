// src/main.ts
import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // Adjust the path as needed

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({
        origin: '*', // Adjust according to your requirements
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
    });

    const config = new DocumentBuilder()
        .setTitle('Cadriciel Serveur')
        .setDescription('Serveur du projet de base pour le cours de LOG2990')
        .setVersion('1.0.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Register the global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());


    await app.listen(process.env.PORT);
};

bootstrap();
