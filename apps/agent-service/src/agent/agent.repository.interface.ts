import { Agent } from '@ai-agency/contracts';

export const AGENT_REPOSITORY = 'AGENT_REPOSITORY';

export interface IAgentRepository {
  findAll(): Promise<Agent[]>;
  findById(id: string): Promise<Agent | undefined>;
  findBySequenceNumber(seq: number): Promise<Agent | undefined>;
  save(agent: Agent): Promise<void>;
  update(id: string, updates: Partial<Agent>): Promise<Agent | undefined>;
  delete(id: string): Promise<boolean>;
  getNextSequenceNumber(): Promise<number>;
  getRegularAgentCount(): Promise<number>;
}
