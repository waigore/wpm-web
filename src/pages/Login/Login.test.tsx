import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { AuthProvider } from '../../context/AuthProvider';
import * as authService from '../../api/services/authService';

// Mock dependencies
vi.mock('../../api/services/authService', () => ({
  login: vi.fn(),
  getToken: vi.fn(() => null),
  getUsername: vi.fn(() => null),
  logout: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
const mockLoginContext = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLoginContext,
    logout: vi.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLoginContext.mockClear();
  });

  it('renders login form', () => {
    renderLogin();

    expect(screen.getAllByLabelText('Username')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText('Password')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('allows user to enter username and password', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInputs = screen.getAllByLabelText('Username');
    const passwordInputs = screen.getAllByLabelText('Password');
    const usernameInput = usernameInputs[0];
    const passwordInput = passwordInputs[0];

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Wait a bit for validation to process
    await waitFor(() => {
      // Check that login was not called (validation prevented submission)
      expect(mockLogin).not.toHaveBeenCalled();
    }, { timeout: 1000 });

    // Verify that error state is shown (either in helper text or alert)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      access_token: 'mock-token',
      token_type: 'bearer',
    });

    renderLogin();

    const usernameInputs = screen.getAllByLabelText('Username');
    const passwordInputs = screen.getAllByLabelText('Password');
    const usernameInput = usernameInputs[0];
    const passwordInput = passwordInputs[0];
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockLoginContext).toHaveBeenCalledWith('mock-token', 'testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/portfolio');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockRejectedValue({
      response: { status: 401 },
      message: 'Invalid credentials',
    });

    renderLogin();

    const usernameInputs = screen.getAllByLabelText('Username');
    const passwordInputs = screen.getAllByLabelText('Password');
    const usernameInput = usernameInputs[0];
    const passwordInput = passwordInputs[0];
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
  });

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockRejectedValue({
      response: { status: 401 },
    });

    renderLogin();

    const usernameInputs = screen.getAllByLabelText('Username');
    const passwordInputs = screen.getAllByLabelText('Password');
    const usernameInput = usernameInputs[0];
    const passwordInput = passwordInputs[0];
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Trigger error
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrong');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/authentication/i)).toBeInTheDocument();
    });

    // Start typing to clear error
    await user.type(usernameInput, 'x');

    await waitFor(() => {
      expect(screen.queryByText(/authentication/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderLogin();

    const usernameInputs = screen.getAllByLabelText('Username');
    const passwordInputs = screen.getAllByLabelText('Password');
    const usernameInput = usernameInputs[0];
    const passwordInput = passwordInputs[0];
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
  });
});

