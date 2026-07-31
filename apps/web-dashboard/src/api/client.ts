import type { Agent, AgentRole } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(body.message ?? res.statusText, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function login(password: string): Promise<{ ok: boolean }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
}

export function logout(): Promise<{ ok: boolean }> {
  return request('/auth/logout', { method: 'POST' });
}

export function checkSession(): Promise<{ authenticated: boolean }> {
  return request('/auth/session');
}

export function getAgents(): Promise<Agent[]> {
  return request('/api/agents');
}

export function createAgent(data: { name: string; role: AgentRole }): Promise<Agent> {
  return request('/api/agents', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAgentRole(id: string, role: AgentRole): Promise<Agent> {
  return request(`/api/agents/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export function deleteAgent(id: string): Promise<void> {
  return request(`/api/agents/${id}`, { method: 'DELETE' });
}
