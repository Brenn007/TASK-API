import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Fonction principale de démarrage de l'application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Playlist API')
    .setDescription('API REST de gestion de playlists musicales avec authentification JWT et RBAC')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des tokens JWT')
    .addTag('songs', 'Gestion des chansons (CRUD)')
    .addTag('playlists', 'Gestion des playlists musicales')
    .addTag('admin', 'Administration (RBAC - ADMIN uniquement)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT (obtenu via /auth/login)',
        in: 'header',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT-Refresh',
        description: 'Entrez votre refresh token (obtenu via /auth/login)',
        in: 'header',
      },
      'refresh-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`
  🎵 Playlist API démarrée avec succès!
  🚀 Serveur: http://localhost:${port}
  📚 Swagger UI: http://localhost:${port}/api
  `);
}

bootstrap();
