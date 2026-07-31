export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly upstreamCode?: string,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export const UpstreamErrorCodes = {
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UPSTREAM_TIMEOUT: 'UPSTREAM_TIMEOUT',
  UPSTREAM_ERROR: 'UPSTREAM_ERROR',
} as const;
