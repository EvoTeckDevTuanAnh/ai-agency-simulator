import { useEffect, useState, useMemo } from 'react';
import type { Agent, AgentRole } from '../types';
import { MAX_AGENTS } from '../types';
import { getAgents, createAgent, updateAgentRole, deleteAgent } from '../api/client';
import { AgentCard } from '../components/AgentCard';
import { AgentDetailPopup } from '../components/AgentDetailPopup';
import { AgentForm } from '../components/AgentForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RoleEditPopup } from '../components/RoleEditPopup';
import './AgentsPage.css';

type ViewState = 'loading' | 'error' | 'ready';

export function AgentsPage() {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchRole, setSearchRole] = useState('');

  const [detailAgent, setDetailAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editRoleAgent, setEditRoleAgent] = useState<Agent | null>(null);
  const [deleteAgentData, setDeleteAgentData] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadAgents() {
    setViewState('loading');
    setError('');
    try {
      const data = await getAgents();
      setAgents(data);
      setViewState('ready');
    } catch (err: any) {
      setError(err.message ?? 'Failed to load agents');
      setViewState('error');
    }
  }

  useEffect(() => { loadAgents(); }, []);

  const filtered = useMemo(() => {
    const name = searchName.toLowerCase().trim();
    const role = searchRole.toUpperCase().trim();
    return agents.filter((a) => {
      if (name && !a.name.toLowerCase().includes(name)) return false;
      if (role && a.role !== role) return false;
      return true;
    });
  }, [agents, searchName, searchRole]);

  const regularCount = agents.filter((a) => a.role !== 'DIRECTOR').length;
  const canCreate = regularCount < MAX_AGENTS;

  async function handleCreate(name: string, role: AgentRole) {
    await createAgent({ name, role });
    setShowForm(false);
    await loadAgents();
  }

  async function handleEditRole(agentId: string, role: AgentRole) {
    await updateAgentRole(agentId, role);
    setEditRoleAgent(null);
    await loadAgents();
  }

  async function handleDelete() {
    if (!deleteAgentData) return;
    setDeleting(true);
    try {
      await deleteAgent(deleteAgentData.id);
      setDeleteAgentData(null);
      await loadAgents();
    } finally {
      setDeleting(false);
    }
  }

  const roles = useMemo(() => {
    const set = new Set(agents.map((a) => a.role));
    return ['', ...Array.from(set)] as const;
  }, [agents]);

  return (
    <div className="agents-page">
      <div className="page-header">
        <h1 className="page-title">Agent Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          disabled={!canCreate}
          title={!canCreate ? `Maximum of ${MAX_AGENTS} agents reached` : ''}
        >
          + Add Agent
        </button>
      </div>

      {!canCreate && (
        <p className="limit-notice">Maximum of {MAX_AGENTS} agents reached. Delete an agent to add a new one.</p>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select value={searchRole} onChange={(e) => setSearchRole(e.target.value)}>
          <option value="">All roles</option>
          {roles.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {viewState === 'loading' && <p className="state-msg">Loading agents...</p>}
      {viewState === 'error' && (
        <div className="state-msg error-msg">
          <p>{error}</p>
          <button className="btn-secondary" onClick={loadAgents}>Retry</button>
        </div>
      )}
      {viewState === 'ready' && filtered.length === 0 && (
        <p className="state-msg">
          {searchName || searchRole ? 'No agents match your search.' : 'No agents found.'}
        </p>
      )}
      {viewState === 'ready' && filtered.length > 0 && (
        <div className="agent-grid">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDetail={setDetailAgent}
              onEditRole={setEditRoleAgent}
              onDelete={setDeleteAgentData}
            />
          ))}
        </div>
      )}

      {detailAgent && (
        <AgentDetailPopup agent={detailAgent} onClose={() => setDetailAgent(null)} />
      )}

      {showForm && (
        <AgentForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editRoleAgent && (
        <RoleEditPopup
          agent={editRoleAgent}
          onSubmit={handleEditRole}
          onCancel={() => setEditRoleAgent(null)}
        />
      )}

      {deleteAgentData && (
        <ConfirmDialog
          title="Delete Agent"
          message={`Are you sure you want to delete "${deleteAgentData.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteAgentData(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
