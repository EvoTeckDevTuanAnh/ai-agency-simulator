import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AgentsPage } from '../pages/AgentsPage';
import type { Agent } from '../types';

const mockGetAgents = vi.fn();
const mockCreateAgent = vi.fn();
const mockUpdateAgentRole = vi.fn();
const mockDeleteAgent = vi.fn();

vi.mock('../api/client', () => ({
  getAgents: (...args: any[]) => mockGetAgents(...args),
  createAgent: (...args: any[]) => mockCreateAgent(...args),
  updateAgentRole: (...args: any[]) => mockUpdateAgentRole(...args),
  deleteAgent: (...args: any[]) => mockDeleteAgent(...args),
  login: vi.fn(),
  logout: vi.fn(),
  checkSession: vi.fn(),
}));

const DIRECTOR: Agent = { id: 'd-1', name: 'Alice', role: 'DIRECTOR' };
const DEV: Agent = { id: 'a-1', name: 'Bob', role: 'DEVELOPER' };
const DESIGNER: Agent = { id: 'a-2', name: 'Charlie', role: 'DESIGNER' };
const TESTER: Agent = { id: 'a-3', name: 'Diana', role: 'TESTER' };
const DEVOPS: Agent = { id: 'a-4', name: 'Eve', role: 'DEVOPS' };
const EXTRA: Agent = { id: 'a-5', name: 'Frank', role: 'DEVELOPER' };

function renderAgents() {
  return render(
    <MemoryRouter>
      <AgentsPage />
    </MemoryRouter>
  );
}

describe('AgentsPage', () => {
  beforeEach(() => {
    mockGetAgents.mockReset();
    mockCreateAgent.mockReset();
    mockUpdateAgentRole.mockReset();
    mockDeleteAgent.mockReset();
  });

  it('shows loading state', () => {
    mockGetAgents.mockReturnValue(new Promise(() => {}));
    renderAgents();
    expect(screen.getByText('Loading agents...')).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    mockGetAgents.mockRejectedValue(new Error('Network error'));
    renderAgents();
    expect(await screen.findByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows empty state when no agents', async () => {
    mockGetAgents.mockResolvedValue([]);
    renderAgents();
    expect(await screen.findByText('No agents found.')).toBeInTheDocument();
  });

  it('renders agent cards', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR, DEV, DESIGNER]);
    renderAgents();
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
  });

  it('filters by name', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR, DEV, DESIGNER]);
    const user = userEvent.setup();
    renderAgents();

    await screen.findByText('Alice');

    await user.type(screen.getByPlaceholderText('Search by name...'), 'Bob');

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('filters by role', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR, DEV, DESIGNER]);
    const user = userEvent.setup();
    renderAgents();

    await screen.findByText('Alice');

    await user.selectOptions(
      screen.getByRole('combobox'),
      'DIRECTOR'
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('opens detail popup on card click', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR]);
    const user = userEvent.setup();
    renderAgents();

    await screen.findByText('Alice');
    await user.click(screen.getByText('Alice'));

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('d-1')).toBeInTheDocument();
  });

  it('does not show edit/delete on Director card', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR]);
    renderAgents();

    await screen.findByText('Alice');

    expect(screen.queryByTitle('Edit role')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('shows edit/delete on non-Director card', async () => {
    mockGetAgents.mockResolvedValue([DEV]);
    renderAgents();

    await screen.findByText('Bob');

    expect(screen.getByTitle('Edit role')).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });

  it('creates an agent', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR, DEV]);
    mockCreateAgent.mockResolvedValue(EXTRA);
    const user = userEvent.setup();
    renderAgents();

    await screen.findByText('Bob');
    await user.click(screen.getByText('+ Add Agent'));

    await user.type(screen.getByPlaceholderText('Agent name'), 'Frank');
    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreateAgent).toHaveBeenCalledWith({ name: 'Frank', role: 'DEVELOPER' });
    });
  });

  it('edits agent role', async () => {
    mockGetAgents.mockResolvedValue([DEV]);
    mockUpdateAgentRole.mockResolvedValue({ ...DEV, role: 'DESIGNER' });
    const user = userEvent.setup();
    renderAgents();

    await screen.findByText('Bob');
    await user.click(screen.getByTitle('Edit role'));

    const comboboxes = screen.getAllByRole('combobox');
    const roleSelect = comboboxes[comboboxes.length - 1];
    await user.selectOptions(roleSelect, 'DESIGNER');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdateAgentRole).toHaveBeenCalledWith('a-1', 'DESIGNER');
    });
  });

  it('deletes an agent with confirmation', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR, DEV]);
    mockDeleteAgent.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderAgents();

    await screen.findByText('Bob');
    await user.click(screen.getByTitle('Delete'));

    expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDeleteAgent).toHaveBeenCalledWith('a-1');
    });
  });

  it('disables create button when at max agents', async () => {
    mockGetAgents.mockResolvedValue([DEV, DESIGNER, TESTER, DEVOPS, EXTRA]);
    renderAgents();

    await screen.findByText('Bob');

    expect(screen.getByText('+ Add Agent')).toBeDisabled();
    expect(screen.getByText(/Maximum of 5 agents reached/)).toBeInTheDocument();
  });

  it('enables create button when under max agents', async () => {
    mockGetAgents.mockResolvedValue([DIRECTOR, DEV]);
    renderAgents();

    await screen.findByText('Bob');

    expect(screen.getByText('+ Add Agent')).not.toBeDisabled();
  });
});
