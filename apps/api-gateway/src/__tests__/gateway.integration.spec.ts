import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as http from 'http';
import { GatewayModule } from '../gateway/gateway.module';
import { AgentGatewayService } from '../gateway/agent-gateway.service';
import { SessionGuard } from '../auth/session.guard';
import { GatewayError } from '../common/gateway-error';

function httpGet(app: INestApplication, path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === 'string') { reject(new Error('Server not listening')); return; }
    const req = http.get(
      { hostname: '127.0.0.1', port: address.port, path, headers: { host: 'localhost' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode!, body: data ? JSON.parse(data) : undefined });
          } catch {
            resolve({ status: res.statusCode!, body: data });
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

function httpPost(app: INestApplication, path: string, body: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === 'string') { reject(new Error('Server not listening')); return; }
    const data = JSON.stringify(body);
    const options = {
      hostname: '127.0.0.1', port: address.port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), host: 'localhost' },
    };
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode!, body: responseData ? JSON.parse(responseData) : undefined });
        } catch {
          resolve({ status: res.statusCode!, body: responseData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpPatch(app: INestApplication, path: string, body: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === 'string') { reject(new Error('Server not listening')); return; }
    const data = JSON.stringify(body);
    const options = {
      hostname: '127.0.0.1', port: address.port, path, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), host: 'localhost' },
    };
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode!, body: responseData ? JSON.parse(responseData) : undefined });
        } catch {
          resolve({ status: res.statusCode!, body: responseData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpDelete(app: INestApplication, path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.getHttpServer();
    const address = server.address();
    if (!address || typeof address === 'string') { reject(new Error('Server not listening')); return; }
    const options = {
      hostname: '127.0.0.1', port: address.port, path, method: 'DELETE',
      headers: { host: 'localhost' },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode!, body: data ? JSON.parse(data) : undefined });
        } catch {
          resolve({ status: res.statusCode!, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

class MockAgentService {
  private agents: Record<string, unknown>[] = [
    { id: 'director-001', sequenceNumber: 0, name: 'Director', role: 'DIRECTOR', status: 'WORKING', isDirector: true, createdAt: new Date().toISOString() },
  ];
  private nextSeq = 1;

  async getHealth() { return { status: 'ok' }; }
  async getAgents() { return this.agents; }

  async getAgentById(id: string) {
    const agent = this.agents.find((a: any) => a.id === id);
    if (!agent) throw new GatewayError(`Agent with id "${id}" not found`, 404, 'AGENT_NOT_FOUND');
    return agent;
  }

  async createAgent(data: { role: string }) {
    if (data.role === 'DIRECTOR') throw new GatewayError('Cannot create an agent with DIRECTOR role', 400, 'CANNOT_CREATE_DIRECTOR');
    const regularCount = this.agents.filter((a: any) => !a.isDirector).length;
    if (regularCount >= 5) throw new GatewayError('Maximum of 5 regular agents reached', 400, 'MAX_AGENTS_REACHED');
    if (!['DEVELOPER', 'DESIGNER', 'CONTENT', 'TESTER'].includes(data.role)) throw new GatewayError(`Invalid role: ${data.role}`, 400, 'INVALID_ROLE');
    const seq = this.nextSeq++;
    const pad = seq.toString().padStart(2, '0');
    const agent = { id: `agent-${pad}`, sequenceNumber: seq, name: `Agent ${pad}`, role: data.role, status: 'ENTERING', isDirector: false, createdAt: new Date().toISOString() };
    this.agents.push(agent);
    return agent;
  }

  async updateAgentRole(id: string, data: { role: string }) {
    const agent = this.agents.find((a: any) => a.id === id);
    if (!agent) throw new GatewayError(`Agent with id "${id}" not found`, 404, 'AGENT_NOT_FOUND');
    if ((agent as any).isDirector) throw new GatewayError('Cannot modify the Director', 400, 'CANNOT_MODIFY_DIRECTOR');
    (agent as any).role = data.role;
    return agent;
  }

  async deleteAgent(id: string) {
    const idx = this.agents.findIndex((a: any) => a.id === id);
    if (idx === -1) throw new GatewayError(`Agent with id "${id}" not found`, 404, 'AGENT_NOT_FOUND');
    if ((this.agents[idx] as any).isDirector) throw new GatewayError('Cannot delete the Director', 400, 'CANNOT_DELETE_DIRECTOR');
    this.agents.splice(idx, 1);
  }

  reset() {
    this.agents = [
      { id: 'director-001', sequenceNumber: 0, name: 'Director', role: 'DIRECTOR', status: 'WORKING', isDirector: true, createdAt: new Date().toISOString() },
    ];
    this.nextSeq = 1;
  }
}

describe('API Gateway Integration', () => {
  let app: INestApplication;
  let mockService: MockAgentService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GatewayModule],
    })
      .overrideProvider(AgentGatewayService)
      .useClass(MockAgentService)
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    mockService = moduleRef.get(AgentGatewayService) as unknown as MockAgentService;
    app = moduleRef.createNestApplication();
    app.enableCors();
    await app.init();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockService.reset();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await httpGet(app, '/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/agents', () => {
    it('should return agent list', async () => {
      const res = await httpGet(app, '/api/agents');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should return agent by id', async () => {
      const res = await httpGet(app, '/api/agents/director-001');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Director');
    });

    it('should return 404 for nonexistent agent', async () => {
      const res = await httpGet(app, '/api/agents/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      const res = await httpPost(app, '/api/agents', { role: 'DEVELOPER' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Agent 01');
    });

    it('should return 400 for DIRECTOR role', async () => {
      const res = await httpPost(app, '/api/agents', { role: 'DIRECTOR' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid role', async () => {
      const res = await httpPost(app, '/api/agents', { role: 'INVALID' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when max agents reached', async () => {
      const roles = ['DEVELOPER', 'DESIGNER', 'CONTENT', 'TESTER', 'DEVELOPER'];
      for (const role of roles) {
        await httpPost(app, '/api/agents', { role });
      }
      const res = await httpPost(app, '/api/agents', { role: 'DEVELOPER' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/agents/:id/role', () => {
    it('should update agent role', async () => {
      const createRes = await httpPost(app, '/api/agents', { role: 'DEVELOPER' });
      const agentId = createRes.body.id;
      const res = await httpPatch(app, `/api/agents/${agentId}/role`, { role: 'DESIGNER' });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('DESIGNER');
    });

    it('should return 400 when updating director', async () => {
      const res = await httpPatch(app, '/api/agents/director-001/role', { role: 'DEVELOPER' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for nonexistent agent', async () => {
      const res = await httpPatch(app, '/api/agents/nonexistent/role', { role: 'DEVELOPER' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should delete a regular agent', async () => {
      const createRes = await httpPost(app, '/api/agents', { role: 'TESTER' });
      const agentId = createRes.body.id;
      const res = await httpDelete(app, `/api/agents/${agentId}`);
      expect(res.status).toBe(204);
    });

    it('should return 400 when deleting director', async () => {
      const res = await httpDelete(app, '/api/agents/director-001');
      expect(res.status).toBe(400);
    });

    it('should return 404 for nonexistent agent', async () => {
      const res = await httpDelete(app, '/api/agents/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('Upstream service unavailable', () => {
    it('should return 503 when upstream errors', async () => {
      const moduleRef2 = await Test.createTestingModule({
        imports: [GatewayModule],
      })
        .overrideProvider(AgentGatewayService)
        .useValue({
          getHealth: async () => { throw new GatewayError('Agent service is unavailable', 503, 'SERVICE_UNAVAILABLE'); },
          getAgents: async () => { throw new Error('unused'); },
          getAgentById: async () => { throw new Error('unused'); },
          createAgent: async () => { throw new Error('unused'); },
          updateAgentRole: async () => { throw new Error('unused'); },
          deleteAgent: async () => { throw new Error('unused'); },
        } as unknown as AgentGatewayService)
        .overrideGuard(SessionGuard)
        .useValue({ canActivate: () => true })
        .compile();

      const app2 = moduleRef2.createNestApplication();
      await app2.init();
      await app2.listen(0);

      const res = await httpGet(app2, '/api/health');
      expect(res.status).toBe(503);

      await app2.close();
    });
  });
});
