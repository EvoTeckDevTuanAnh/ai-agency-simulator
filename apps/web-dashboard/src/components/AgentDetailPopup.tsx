import type { Agent } from '../types';
import './AgentDetailPopup.css';

interface AgentDetailPopupProps {
  agent: Agent;
  onClose: () => void;
}

export function AgentDetailPopup({ agent, onClose }: AgentDetailPopupProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&#x2716;</button>
        <h2>{agent.name}</h2>
        <div className="detail-field">
          <span className="detail-label">ID</span>
          <span className="detail-value">{agent.id}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Role</span>
          <span className="detail-value">{agent.role}</span>
        </div>
      </div>
    </div>
  );
}
