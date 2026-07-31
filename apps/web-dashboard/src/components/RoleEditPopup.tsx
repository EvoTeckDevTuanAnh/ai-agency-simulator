import { useState, type FormEvent } from 'react';
import type { Agent, AgentRole } from '../types';
import { AGENT_ROLES } from '../types';
import './RoleEditPopup.css';

interface RoleEditPopupProps {
  agent: Agent;
  onSubmit: (agentId: string, role: AgentRole) => Promise<void>;
  onCancel: () => void;
}

export function RoleEditPopup({ agent, onSubmit, onCancel }: RoleEditPopupProps) {
  const [role, setRole] = useState<AgentRole>(agent.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (role === agent.role) {
      onCancel();
      return;
    }
    setLoading(true);
    try {
      await onSubmit(agent.id, role);
    } catch (err: any) {
      setError(err.message ?? 'Failed to update role');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Role</h2>
        <p className="edit-role-name">{agent.name}</p>
        <form className="role-edit-form" onSubmit={handleSubmit}>
          <select value={role} onChange={(e) => setRole(e.target.value as AgentRole)} disabled={loading}>
            {AGENT_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading || role === agent.role}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
