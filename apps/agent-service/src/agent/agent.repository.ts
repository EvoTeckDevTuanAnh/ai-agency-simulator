import { Injectable, Optional, Inject } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { Agent, AgentRole, AgentStatus } from '@ai-agency/contracts';
import { IAgentRepository } from './agent.repository.interface';
import { AgentError, ErrorCodes } from '../common/agent-error';

interface StoreData {
  agents: Agent[];
  nextSequenceNumber: number;
}

@Injectable()
export class JsonAgentRepository implements IAgentRepository {
  private readonly filePath: string;
  private data: StoreData;

  constructor(@Optional() @Inject('DATA_DIR') dataDir?: string) {
    const dir = dataDir ?? resolve(__dirname, '..', '..', '..', 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    this.filePath = join(dir, 'agents.json');
    this.data = { agents: [], nextSequenceNumber: 1 };
    this.load();
    this.ensureDirector();
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw) as StoreData;
      }
    } catch {
      this.data = { agents: [], nextSequenceNumber: 1 };
    }
  }

  private persist(): void {
    const dataDir = dirname(this.filePath);
    if (!existsSync(dataDir)) {
      throw new AgentError(
        ErrorCodes.DATA_DIRECTORY_MISSING,
        'Data directory does not exist',
        500,
      );
    }
    const tmpPath = this.filePath + '.tmp';
    writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
    renameSync(tmpPath, this.filePath);
  }

  private ensureDirector(): void {
    const director = this.data.agents.find((a) => a.isDirector);
    if (!director) {
      const now = new Date();
      const agent: Agent = {
        id: 'director-001',
        sequenceNumber: 0,
        name: 'Director',
        role: AgentRole.DIRECTOR,
        status: AgentStatus.WORKING,
        isDirector: true,
        createdAt: now,
      };
      this.data.agents.push(agent);
      this.persist();
    }
  }

  async findAll(): Promise<Agent[]> {
    return [...this.data.agents];
  }

  async findById(id: string): Promise<Agent | undefined> {
    return this.data.agents.find((a) => a.id === id);
  }

  async findBySequenceNumber(seq: number): Promise<Agent | undefined> {
    return this.data.agents.find((a) => a.sequenceNumber === seq);
  }

  async save(agent: Agent): Promise<void> {
    this.data.agents.push(agent);
    this.persist();
  }

  async update(id: string, updates: Partial<Agent>): Promise<Agent | undefined> {
    const index = this.data.agents.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.data.agents[index] = { ...this.data.agents[index], ...updates };
    this.persist();
    return this.data.agents[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.agents.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.data.agents.splice(index, 1);
    this.persist();
    return true;
  }

  async getNextSequenceNumber(): Promise<number> {
    const seq = this.data.nextSequenceNumber;
    this.data.nextSequenceNumber += 1;
    this.persist();
    return seq;
  }

  async getRegularAgentCount(): Promise<number> {
    return this.data.agents.filter((a) => !a.isDirector).length;
  }
}
