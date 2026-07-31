import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../components/LoginPage';

const mockLogin = vi.fn();

vi.mock('../api/client', () => ({
  login: (...args: any[]) => mockLogin(...args),
  logout: vi.fn(),
  checkSession: vi.fn(),
  getAgents: vi.fn(),
  createAgent: vi.fn(),
  updateAgentRole: vi.fn(),
  deleteAgent: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('Login', () => {
  it('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows error on wrong password', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid password'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Password'), 'wrong');
    await user.click(screen.getByText('Sign In'));

    expect(await screen.findByText('Invalid password')).toBeInTheDocument();
  });

  it('disables button when password is empty', () => {
    renderLogin();
    expect(screen.getByText('Sign In')).toBeDisabled();
  });

  it('enables button when password is entered', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('Password'), 'admin');
    expect(screen.getByText('Sign In')).not.toBeDisabled();
  });
});
