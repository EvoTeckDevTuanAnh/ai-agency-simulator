import { AgentRole, AgentStatus } from './enums';

export interface Agent {
  id: string;
  sequenceNumber: number;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  isDirector: boolean;
  createdAt: Date;
}
