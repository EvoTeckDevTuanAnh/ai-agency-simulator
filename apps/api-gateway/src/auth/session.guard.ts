import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { AuthGatewayService } from './auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(AuthGatewayService) private readonly auth: AuthGatewayService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.session;

    if (!token) {
      throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.auth.validateSession(token);
      return true;
    } catch {
      throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
    }
  }
}
