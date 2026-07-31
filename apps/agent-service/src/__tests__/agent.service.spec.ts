import { describe, it, expect, beforeEach } from 'vitest';
import { Agent, AgentRole, AgentStatus } from '@ai-agency/contracts';
import { AgentService } from '../agent/agent.service';
import { IAgentRepository } from '../agent/agent.repository.interface';
import { AgentError } from '../common/agent-error';

function createMockAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'agent-01',
    sequenceNumber: 1,
    name: 'Agent 01',
    role: AgentRole.DEVELOPER,
    status: AgentStatus.ENTERING,
    isDirector: false,
    createdAt: new Date(),
    ...overrides,
  };
}

class MockRepository implements IAgentRepository {
  private agents: Agent[] = [];
  private nextSeq = 1;

  setAgents(agents: Agent[]) {
    this.agents = agents;
    const maxSeq = agents.reduce((m, a) => Math.max(m, a.sequenceNumber), 0);
    this.nextSeq = maxSeq + 1;
  }

  async findAll(): Promise<Agent[]> {
    return [...this.agents];
  }

  async findById(id: string): Promise<Agent | undefined> {
    return this.agents.find((a) => a.id === id);
  }

  async findBySequenceNumber(seq: number): Promise<Agent | undefined> {
    return this.agents.find((a) => a.sequenceNumber === seq);
  }

  async save(agent: Agent): Promise<void> {
    this.agents.push(agent);
  }

  async update(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const i = this.agents.findIndex((a) => a.id === id);
    if (i === -1) return undefined;
    this.agents[i] = { ...this.agents[i], ...updates };
    return this.agents[i];
  }

  async delete(id: string): Promise<boolean> {
    const i = this.agents.findIndex((a) => a.id === id);
    if (i === -1) return false;
    this.agents.splice(i, 1);
    return true;
  }

  async getNextSequenceNumber(): Promise<number> {
    return this.nextSeq++;
  }

  async getRegularAgentCount(): Promise<number> {
    return this.agents.filter((a) => !a.isDirector).length;
  }
}

describe('AgentService', () => {
  let repo: MockRepository;
  let service: AgentService;

  beforeEach(() => {
    repo = new MockRepository();
    service = new AgentService(repo);
  });

  describe('getHealth', () => {
    it('should return status ok', () => {
      const result = service.getHealth();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('getAllAgents', () => {
    it('should return empty array when no agents', async () => {
      expect(await service.getAllAgents()).toEqual([]);
    });

    it('should return all agents', async () => {
      repo.setAgents([
        createMockAgent({ id: 'a1', sequenceNumber: 1 }),
        createMockAgent({ id: 'a2', sequenceNumber: 2 }),
      ]);
      expect(await service.getAllAgents()).toHaveLength(2);
    });
  });

  describe('getAgentById', () => {
    it('should find agent by id', async () => {
      repo.setAgents([createMockAgent({ id: 'a1' })]);
      const agent = await service.getAgentById('a1');
      expect(agent.id).toBe('a1');
    });

    it('should throw if agent not found', async () => {
      await expect(service.getAgentById('nonexistent')).rejects.toThrow(AgentError);
    });
  });

  describe('createAgent', () => {
    it('should create agent with auto-incremented name', async () => {
      const agent = await service.createAgent({ role: AgentRole.DEVELOPER });
      expect(agent.name).toBe('Agent 01');
      expect(agent.sequenceNumber).toBe(1);
      expect(agent.isDirector).toBe(false);
      expect(agent.status).toBe(AgentStatus.ENTERING);
    });

    it('should auto-increment name on multiple creates', async () => {
      const a1 = await service.createAgent({ role: AgentRole.DEVELOPER });
      const a2 = await service.createAgent({ role: AgentRole.DESIGNER });
      expect(a1.name).toBe('Agent 01');
      expect(a2.name).toBe('Agent 02');
    });

    it('should not reuse deleted sequence numbers', async () => {
      const a1 = await service.createAgent({ role: AgentRole.DEVELOPER });
      await service.deleteAgent(a1.id);
      const a2 = await service.createAgent({ role: AgentRole.TESTER });
      expect(a2.name).toBe('Agent 02');
      expect(a2.sequenceNumber).toBe(2);
    });

    it('should throw when creating DIRECTOR role', async () => {
      await expect(service.createAgent({ role: AgentRole.DIRECTOR })).rejects.toThrow(AgentError);
    });

    it('should throw when max agents reached', async () => {
      const roles = [
        AgentRole.DEVELOPER,
        AgentRole.DESIGNER,
        AgentRole.CONTENT,
        AgentRole.TESTER,
        AgentRole.DEVELOPER,
      ];
      for (const role of roles) {
        await service.createAgent({ role });
      }
      await expect(service.createAgent({ role: AgentRole.DEVELOPER })).rejects.toThrow(AgentError);
    });

    it('should allow exactly 5 regular agents', async () => {
      const roles = [
        AgentRole.DEVELOPER,
        AgentRole.DESIGNER,
        AgentRole.CONTENT,
        AgentRole.TESTER,
        AgentRole.DEVELOPER,
      ];
      for (const role of roles) {
        await service.createAgent({ role });
      }
      expect(await service.getAllAgents()).toHaveLength(5);
    });
  });

  describe('updateAgentRole', () => {
    it('should update agent role', async () => {
      const agent = await service.createAgent({ role: AgentRole.DEVELOPER });
      const updated = await service.updateAgentRole(agent.id, { role: AgentRole.DESIGNER });
      expect(updated.role).toBe(AgentRole.DESIGNER);
    });

    it('should throw when updating director', async () => {
      repo.setAgents([
        createMockAgent({
          id: 'director-001',
          name: 'Director',
          role: AgentRole.DIRECTOR,
          isDirector: true,
          sequenceNumber: 0,
        }),
      ]);
      await expect(
        service.updateAgentRole('director-001', { role: AgentRole.DEVELOPER }),
      ).rejects.toThrow(AgentError);
    });

    it('should throw for nonexistent agent', async () => {
      await expect(
        service.updateAgentRole('nonexistent', { role: AgentRole.DEVELOPER }),
      ).rejects.toThrow(AgentError);
    });
  });

  describe('deleteAgent', () => {
    it('should delete a regular agent', async () => {
      const agent = await service.createAgent({ role: AgentRole.DEVELOPER });
      await service.deleteAgent(agent.id);
      await expect(service.getAgentById(agent.id)).rejects.toThrow(AgentError);
    });

    it('should throw when deleting director', async () => {
      repo.setAgents([
        createMockAgent({
          id: 'director-001',
          name: 'Director',
          role: AgentRole.DIRECTOR,
          isDirector: true,
          sequenceNumber: 0,
        }),
      ]);
      await expect(service.deleteAgent('director-001')).rejects.toThrow(AgentError);
    });

    it('should throw for nonexistent agent', async () => {
      await expect(service.deleteAgent('nonexistent')).rejects.toThrow(AgentError);
    });
  });
});
