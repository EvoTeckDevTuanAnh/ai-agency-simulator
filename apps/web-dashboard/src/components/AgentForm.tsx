import { useState, type FormEvent } from 'react';
import type { AgentRole } from '../types';
import { AGENT_ROLES } from '../types';
import './AgentForm.css';

interface AgentFormProps {
  onSubmit: (name: string, role: AgentRole) => Promise<void>;
  onCancel: () => void;
}

export function AgentForm({ onSubmit, onCancel }: AgentFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentRole>('DEVELOPER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(name.trim(), role);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Agent</h2>
        <form className="agent-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              placeholder="Agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as AgentRole)}>
              {AGENT_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
