export type AgentRole = 'DEVELOPER' | 'DESIGNER' | 'TESTER' | 'DEVOPS' | 'DIRECTOR';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
}

export const AGENT_ROLES: AgentRole[] = ['DEVELOPER', 'DESIGNER', 'TESTER', 'DEVOPS'];

export const MAX_AGENTS = 5;
