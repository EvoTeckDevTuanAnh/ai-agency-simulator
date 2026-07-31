import { AgentRole } from './enums';
import { Agent } from './models';

export interface CreateAgentRequest {
  role: AgentRole;
}

export interface UpdateAgentRoleRequest {
  role: AgentRole;
}

export interface AgentResponse {
  id: string;
  sequenceNumber: number;
  name: string;
  role: AgentRole;
  status: string;
  isDirector: boolean;
  createdAt: string;
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
}
