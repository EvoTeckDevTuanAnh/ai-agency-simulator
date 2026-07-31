import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { timeout } from 'rxjs/operators';
import { GatewayError, UpstreamErrorCodes } from '../common/gateway-error';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:3002';
const REQUEST_TIMEOUT = parseInt(process.env.GATEWAY_TIMEOUT_MS || '5000', 10);

@Injectable()
export class AgentGatewayService {
  private readonly logger = new Logger(AgentGatewayService.name);
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = AGENT_SERVICE_URL;
  }

  private async request<T>(method: string, path: string, data?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.log(`-> ${method} ${url}`);

    try {
      const response = await lastValueFrom(
        this.http
          .request<T>({
            method,
            url,
            data,
            headers: { 'Content-Type': 'application/json' },
          })
          .pipe(timeout(REQUEST_TIMEOUT)),
      );
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status || 503;
        const body = err.response?.data as Record<string, unknown> | undefined;

        if (!err.response) {
          this.logger.error(`Agent service unreachable at ${this.baseUrl}`);
          throw new GatewayError(
            'Agent service is unavailable',
            503,
            UpstreamErrorCodes.SERVICE_UNAVAILABLE,
          );
        }

        throw new GatewayError(
          (body?.message as string) || 'Upstream service error',
          status,
          (body?.error as string) || UpstreamErrorCodes.UPSTREAM_ERROR,
        );
      }

      if (err instanceof Error && err.name === 'TimeoutError') {
        this.logger.error(`Request to ${url} timed out after ${REQUEST_TIMEOUT}ms`);
        throw new GatewayError(
          'Agent service did not respond in time',
          504,
          UpstreamErrorCodes.UPSTREAM_TIMEOUT,
        );
      }

      throw err;
    }
  }

  getHealth() {
    return this.request<{ status: string }>('get', '/health');
  }

  getAgents() {
    return this.request<unknown[]>('get', '/agents');
  }

  getAgentById(id: string) {
    return this.request<unknown>('get', `/agents/${id}`);
  }

  createAgent(data: { role: string }) {
    return this.request<unknown>('post', '/agents', data);
  }

  updateAgentRole(id: string, data: { role: string }) {
    return this.request<unknown>('patch', `/agents/${id}/role`, data);
  }

  deleteAgent(id: string) {
    return this.request<void>('delete', `/agents/${id}`);
  }
}
