import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { timeout } from 'rxjs/operators';
import { GatewayError, UpstreamErrorCodes } from '../common/gateway-error';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3003';
const REQUEST_TIMEOUT = parseInt(process.env.GATEWAY_TIMEOUT_MS || '5000', 10);

@Injectable()
export class AuthGatewayService {
  private readonly logger = new Logger(AuthGatewayService.name);
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = AUTH_SERVICE_URL;
  }

  private async request<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['x-session-token'] = token;

    try {
      const response = await lastValueFrom(
        this.http
          .request<T>({ method, url, data: body, headers })
          .pipe(timeout(REQUEST_TIMEOUT)),
      );
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status || 503;
        const data = err.response?.data as Record<string, unknown> | undefined;

        if (!err.response) {
          throw new GatewayError(
            'Auth service is unavailable',
            503,
            UpstreamErrorCodes.SERVICE_UNAVAILABLE,
          );
        }
        throw new GatewayError(
          (data?.message as string) || 'Auth service error',
          status,
          (data?.error as string) || UpstreamErrorCodes.UPSTREAM_ERROR,
        );
      }
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new GatewayError(
          'Auth service did not respond in time',
          504,
          UpstreamErrorCodes.UPSTREAM_TIMEOUT,
        );
      }
      throw err;
    }
  }

  login(password: string) {
    return this.request<{ token: string }>('post', '/auth/login', { password });
  }

  validateSession(token: string) {
    return this.request<{ valid: boolean }>('get', '/auth/check', undefined, token);
  }

  logout(token: string) {
    return this.request<{ ok: boolean }>('post', '/auth/logout', undefined, token);
  }

  getHealth() {
    return this.request<{ status: string }>('get', '/health');
  }
}
