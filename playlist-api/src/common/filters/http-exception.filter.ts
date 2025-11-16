import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtre global pour gérer toutes les exceptions HTTP
 * 
 * Ce filtre intercepte toutes les exceptions et retourne une réponse
 * formatée de manière cohérente avec des messages d'erreur clairs
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Déterminer le code de statut HTTP
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extraire le message d'erreur
    let message = 'Une erreur interne est survenue';
    let errors = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Construire la réponse d'erreur
    const errorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      ...(errors && { errors }),
    };

    // Logger l'erreur en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Exception caught:', exception);
    }

    // Envoyer la réponse
    response.status(status).json(errorResponse);
  }
}
