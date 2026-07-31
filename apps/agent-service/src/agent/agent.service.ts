import { Inject, Injectable } from '@nestjs/common';
import {
  Agent,
  AgentRole,
  AgentStatus,
  CreateAgentRequest,
  UpdateAgentRoleRequest,
} from '@ai-agency/contracts';
import { isValidAgentRole } from '@ai-agency/validation';
import { AGENT_REPOSITORY, IAgentRepository } from './agent.repository.interface';
import { AgentError, ErrorCodes } from '../common/agent-error';

const MAX_REGULAR_AGENTS = 5;

function padNumber(n: number): string {
  return n.toString().padStart(2, '0');
}

@Injectable()
export class AgentService {
  constructor(
    @Inject(AGENT_REPOSITORY) private readonly repository: IAgentRepository,
  ) {}

  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.repository.findAll();
  }

  async getAgentById(id: string): Promise<Agent> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new AgentError(ErrorCodes.AGENT_NOT_FOUND, `Agent with id "${id}" not found`, 404);
    }
    return agent;
  }

  async createAgent(dto: CreateAgentRequest): Promise<Agent> {
    if (dto.role === AgentRole.DIRECTOR) {
      throw new AgentError(
        ErrorCodes.CANNOT_CREATE_DIRECTOR,
        'Cannot create an agent with DIRECTOR role',
      );
    }

    if (!isValidAgentRole(dto.role)) {
      throw new AgentError(ErrorCodes.INVALID_ROLE, `Invalid role: ${dto.role}`);
    }

    const count = await this.repository.getRegularAgentCount();
    if (count >= MAX_REGULAR_AGENTS) {
      throw new AgentError(
        ErrorCodes.MAX_AGENTS_REACHED,
        `Maximum of ${MAX_REGULAR_AGENTS} regular agents reached`,
      );
    }

    const sequenceNumber = await this.repository.getNextSequenceNumber();
    const agent: Agent = {
      id: `agent-${padNumber(sequenceNumber)}`,
      sequenceNumber,
      name: `Agent ${padNumber(sequenceNumber)}`,
      role: dto.role,
      status: AgentStatus.ENTERING,
      isDirector: false,
      createdAt: new Date(),
    };

    await this.repository.save(agent);
    return agent;
  }

  async updateAgentRole(id: string, dto: UpdateAgentRoleRequest): Promise<Agent> {
    const agent = await this.getAgentById(id);

    if (agent.isDirector) {
      throw new AgentError(
        ErrorCodes.CANNOT_MODIFY_DIRECTOR,
        'Cannot modify the Director',
      );
    }

    if (!isValidAgentRole(dto.role)) {
      throw new AgentError(ErrorCodes.INVALID_ROLE, `Invalid role: ${dto.role}`);
    }

    const updated = await this.repository.update(id, { role: dto.role });
    return updated!;
  }

  async deleteAgent(id: string): Promise<void> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new AgentError(ErrorCodes.AGENT_NOT_FOUND, `Agent with id "${id}" not found`, 404);
    }

    if (agent.isDirector) {
      throw new AgentError(
        ErrorCodes.CANNOT_DELETE_DIRECTOR,
        'Cannot delete the Director',
      );
    }

    await this.repository.delete(id);
  }
}
