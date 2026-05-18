import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details: unknown;
  requestId: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Use an existing requestId from the request (set by middleware) or generate one
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? uuidv4();

    let statusCode: number;
    let error: string;
    let message: string;
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
        details = null;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        message =
          typeof resp['message'] === 'string'
            ? resp['message']
            : Array.isArray(resp['message'])
              ? (resp['message'] as string[]).join('; ')
              : exception.message;
        error = typeof resp['error'] === 'string' ? resp['error'] : exception.name;
        details = Array.isArray(resp['message']) ? resp['message'] : null;
      } else {
        message = exception.message;
        error = exception.name;
        details = null;
      }
    } else {
      // Unexpected / unhandled errors — do not leak internal details
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'InternalServerError';
      message = 'An unexpected error occurred. Please try again later.';
      details = null;

      this.logger.error(
        `[${requestId}] Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponse = {
      statusCode,
      error,
      message,
      details,
      requestId,
    };

    response.status(statusCode).json(body);
  }
}
