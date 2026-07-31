import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

const mockCheckSession = vi.fn();

vi.mock('../api/client', () => ({
  checkSession: (...args: any[]) => mockCheckSession(...args),
  login: vi.fn(),
  logout: vi.fn(),
  getAgents: vi.fn(),
  createAgent: vi.fn(),
  updateAgentRole: vi.fn(),
  deleteAgent: vi.fn(),
}));

function renderProtected(initial: string = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/agents" element={<div data-testid="agents-page">Agents</div>} />
        </Route>
        <Route path="*" element={<div>Other</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockCheckSession.mockReset();
  });

  it('shows loading while checking session', () => {
    mockCheckSession.mockReturnValue(new Promise(() => {}));
    renderProtected('/agents');
    expect(screen.getByText('Checking session...')).toBeInTheDocument();
  });

  it('renders children when authenticated', async () => {
    mockCheckSession.mockResolvedValue({ authenticated: true });
    renderProtected('/agents');
    expect(await screen.findByTestId('agents-page')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', async () => {
    mockCheckSession.mockResolvedValue({ authenticated: false });
    renderProtected('/agents');
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to login on fetch error', async () => {
    mockCheckSession.mockRejectedValue(new Error('Network error'));
    renderProtected('/agents');
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
  });
});
