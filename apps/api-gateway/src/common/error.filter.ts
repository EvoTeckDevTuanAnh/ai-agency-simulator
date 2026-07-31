import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { GatewayError } from './gateway-error';

@Catch(GatewayError)
export class GatewayErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayErrorFilter.name);

  catch(exception: GatewayError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] || 'unknown';

    this.logger.warn(
      `[${requestId}] ${request.method} ${request.url} -> ${exception.statusCode}: ${exception.message}`,
    );

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      error: exception.upstreamCode || 'GATEWAY_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] || 'unknown';
    const message = exception instanceof Error ? exception.message : 'Internal server error';

    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} -> 500: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
