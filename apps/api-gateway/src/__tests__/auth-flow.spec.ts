import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as http from 'http';
import cookieParser from 'cookie-parser';
import { GatewayModule } from '../gateway/gateway.module';
import { AgentGatewayService } from '../gateway/agent-gateway.service';
import { AuthModule } from '../auth/auth.module';
import { AuthGatewayService } from '../auth/auth.service';
import { GatewayError } from '../common/gateway-error';

const mockAuthServer = {
  tokens: new Map<string, boolean>(),
  nextTokenId: 1,

  handleLogin(password: string): { token: string } | { status: number; message: string } {
    if (password !== 'admin') {
      return { status: 401, message: 'Invalid password' };
    }
    const token = `test-token-${this.nextTokenId++}`;
    this.tokens.set(token, true);
    return { token };
  },

  handleCheck(token: string): { valid: boolean } | { status: number; message: string } {
    if (this.tokens.has(token)) {
      return { valid: true };
    }
    return { status: 401, message: 'Session not found' };
  },

  handleLogout(token: string): { ok: boolean } {
    this.tokens.delete(token);
    return { ok: true };
  },

  reset() {
    this.tokens.clear();
    this.nextTokenId = 1;
  },
};

class MockAuthGatewayService {
  async login(password: string) {
    const result = mockAuthServer.handleLogin(password);
    if ('status' in result) {
      throw new GatewayError(result.message, result.status, 'AUTH_ERROR');
    }
    return result as { token: string };
  }

  async validateSession(token: string) {
    const result = mockAuthServer.handleCheck(token);
    if ('status' in result) {
      throw new GatewayError(result.message, result.status, 'AUTH_ERROR');
    }
    return { valid: true };
  }

  async logout(token: string) {
    return mockAuthServer.handleLogout(token);
  }
}

class MockAgentService {
  async getAgents() {
    return [{ id: 'agent-01', name: 'Test Agent', role: 'DEVELOPER' }];
  }
}

describe('Auth Flow Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GatewayModule, AuthModule],
    })
      .overrideProvider(AgentGatewayService)
      .useClass(MockAgentService)
      .overrideProvider(AuthGatewayService)
      .useClass(MockAuthGatewayService)
      .compile();

    app = moduleRef.createNestApplication();
    app.enableCors();
    app.use(cookieParser());
    await app.init();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockAuthServer.reset();
  });

  function httpRequest(method: string, path: string, body?: any, cookie?: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
    return new Promise((resolve, reject) => {
      const server = app.getHttpServer();
      const address = server.address();
      if (!address || typeof address === 'string') { reject(new Error('Server not listening')); return; }

      const headers: Record<string, string> = { host: 'localhost' };
      if (body) {
        const data = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(data).toString();
      }
      if (cookie) headers['Cookie'] = cookie;

      const options: http.RequestOptions = {
        hostname: '127.0.0.1', port: (address as any).port, path, method, headers,
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode!, headers: res.headers, body: responseData ? JSON.parse(responseData) : undefined });
          } catch {
            resolve({ status: res.statusCode!, headers: res.headers, body: responseData });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  it('should return 401 for protected route without session', async () => {
    const res = await httpRequest('GET', '/api/agents');
    expect(res.status).toBe(401);
  });

  it('should login with correct password and set session cookie', async () => {
    const res = await httpRequest('POST', '/auth/login', { password: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(cookieStr).toContain('session=');
    expect(cookieStr).toContain('HttpOnly');
    expect(cookieStr).toContain('Path=/');
  });

  it('should reject wrong password', async () => {
    const res = await httpRequest('POST', '/auth/login', { password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('should access protected route with valid session cookie', async () => {
    const loginRes = await httpRequest('POST', '/auth/login', { password: 'admin' });
    const cookie = extractCookie(loginRes.headers['set-cookie']!);

    const agentsRes = await httpRequest('GET', '/api/agents', undefined, cookie);
    expect(agentsRes.status).toBe(200);
    expect(Array.isArray(agentsRes.body)).toBe(true);
  });

  it('should reject protected route with invalid session cookie', async () => {
    const res = await httpRequest('GET', '/api/agents', undefined, 'session=invalid-token');
    expect(res.status).toBe(401);
  });

  it('should return session status for authenticated user', async () => {
    const loginRes = await httpRequest('POST', '/auth/login', { password: 'admin' });
    const cookie = extractCookie(loginRes.headers['set-cookie']!);

    const sessionRes = await httpRequest('GET', '/auth/session', undefined, cookie);
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body).toEqual({ authenticated: true });
  });

  it('should return session status for unauthenticated user', async () => {
    const sessionRes = await httpRequest('GET', '/auth/session');
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body).toEqual({ authenticated: false });
  });

  it('should logout and invalidate session', async () => {
    const loginRes = await httpRequest('POST', '/auth/login', { password: 'admin' });
    const cookie = extractCookie(loginRes.headers['set-cookie']!);

    const logoutRes = await httpRequest('POST', '/auth/logout', undefined, cookie);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toEqual({ ok: true });

    const agentsRes = await httpRequest('GET', '/api/agents', undefined, cookie);
    expect(agentsRes.status).toBe(401);
  });

  it('should be able to login again after logout', async () => {
    const login1 = await httpRequest('POST', '/auth/login', { password: 'admin' });
    const cookie1 = extractCookie(login1.headers['set-cookie']!);

    await httpRequest('POST', '/auth/logout', undefined, cookie1);

    const login2 = await httpRequest('POST', '/auth/login', { password: 'admin' });
    const cookie2 = extractCookie(login2.headers['set-cookie']!);

    const agentsRes = await httpRequest('GET', '/api/agents', undefined, cookie2);
    expect(agentsRes.status).toBe(200);
  });
});

function extractCookie(setCookie: string | string[]): string {
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return raw.split(';')[0];
}
