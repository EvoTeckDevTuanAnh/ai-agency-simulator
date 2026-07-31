import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AgentError } from './agent-error';

@Catch(AgentError)
export class AgentErrorFilter implements ExceptionFilter {
  catch(exception: AgentError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      error: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
