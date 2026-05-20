import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Esto activa las validaciones de class-validator globalmente
  app.useGlobalPipes(new ValidationPipe());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('FIFA Players API')
    .setDescription('API para gestionar jugadores de FIFA')
    .setVersion('1.0')
    .addBearerAuth() // indica que los endpoints usan JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // disponible en /api

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:4200', 'http://localhost:4201'],
  });

  await app.listen(3000);
}
bootstrap();