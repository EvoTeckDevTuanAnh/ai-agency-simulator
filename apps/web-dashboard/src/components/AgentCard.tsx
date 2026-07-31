import type { Agent } from '../types';
import './AgentCard.css';

interface AgentCardProps {
  agent: Agent;
  onDetail: (agent: Agent) => void;
  onEditRole: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

const ROLE_COLORS: Record<string, string> = {
  DIRECTOR: '#9b59b6',
  DEVELOPER: '#4a7cff',
  DESIGNER: '#e67e22',
  TESTER: '#2ecc71',
  DEVOPS: '#e74c3c',
};

export function AgentCard({ agent, onDetail, onEditRole, onDelete }: AgentCardProps) {
  const isDirector = agent.role === 'DIRECTOR';

  return (
    <div className="agent-card" onClick={() => onDetail(agent)}>
      <div className="agent-card-avatar" style={{ background: ROLE_COLORS[agent.role] ?? '#888' }}>
        {agent.name.charAt(0).toUpperCase()}
      </div>
      <div className="agent-card-info">
        <span className="agent-card-name">{agent.name}</span>
        <span className="agent-card-role" style={{ color: ROLE_COLORS[agent.role] ?? '#888' }}>
          {agent.role}
        </span>
      </div>
      {!isDirector && (
        <div className="agent-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon" title="Edit role" onClick={() => onEditRole(agent)}>&#x270E;</button>
          <button className="btn-icon btn-danger" title="Delete" onClick={() => onDelete(agent)}>&#x2716;</button>
        </div>
      )}
    </div>
  );
}
