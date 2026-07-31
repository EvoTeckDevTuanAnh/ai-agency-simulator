import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { AgentRole, AgentStatus } from '@ai-agency/contracts';
import { JsonAgentRepository } from '../agent/agent.repository';

describe('JsonAgentRepository', () => {
  let repo: JsonAgentRepository;
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'agent-repo-test-'));
    repo = new JsonAgentRepository(testDir);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should auto-create director on first load', async () => {
    const agents = await repo.findAll();
    const director = agents.find((a) => a.isDirector);
    expect(director).toBeDefined();
    expect(director!.name).toBe('Director');
    expect(director!.role).toBe(AgentRole.DIRECTOR);
    expect(director!.isDirector).toBe(true);
  });

  it('should have exactly one director', async () => {
    const agents = await repo.findAll();
    const directors = agents.filter((a) => a.isDirector);
    expect(directors).toHaveLength(1);
  });

  it('should persist data across restarts', async () => {
    const seq = await repo.getNextSequenceNumber();
    await repo.save({
      id: 'agent-01',
      sequenceNumber: seq,
      name: 'Agent 01',
      role: AgentRole.DEVELOPER,
      status: AgentStatus.ENTERING,
      isDirector: false,
      createdAt: new Date(),
    });

    const repo2 = new JsonAgentRepository(testDir);
    const agents = await repo2.findAll();
    const regular = agents.filter((a) => !a.isDirector);
    expect(regular).toHaveLength(1);
    expect(regular[0].name).toBe('Agent 01');
  });

  it('should return next sequence numbers correctly', async () => {
    expect(await repo.getNextSequenceNumber()).toBe(1);
    expect(await repo.getNextSequenceNumber()).toBe(2);
    expect(await repo.getNextSequenceNumber()).toBe(3);
  });

  it('should track regular agent count excluding director', async () => {
    expect(await repo.getRegularAgentCount()).toBe(0);
    const seq = await repo.getNextSequenceNumber();
    await repo.save({
      id: 'agent-01',
      sequenceNumber: seq,
      name: 'Agent 01',
      role: AgentRole.DEVELOPER,
      status: AgentStatus.ENTERING,
      isDirector: false,
      createdAt: new Date(),
    });
    expect(await repo.getRegularAgentCount()).toBe(1);
    await repo.save({
      id: 'agent-02',
      sequenceNumber: 2,
      name: 'Agent 02',
      role: AgentRole.DESIGNER,
      status: AgentStatus.ENTERING,
      isDirector: false,
      createdAt: new Date(),
    });
    expect(await repo.getRegularAgentCount()).toBe(2);
  });
});
