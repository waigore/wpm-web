import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../api/services/authService';

// Mock authService
vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => null),
  getUsername: vi.fn(() => null),
  logout: vi.fn(),
}));

// Test component that uses useAuth
const TestComponent = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user || 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button
        data-testid="login-btn"
        onClick={() => login('test-token', 'testuser')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null values when no stored auth', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  it('should initialize with stored token and user', () => {
    vi.mocked(authService.getToken).mockReturnValue('stored-token');
    vi.mocked(authService.getUsername).mockReturnValue('stored-user');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('stored-user');
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  it('should update state when login is called', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    act(() => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  it('should clear state when logout is called', () => {
    vi.mocked(authService.getToken).mockReturnValue('stored-token');
    vi.mocked(authService.getUsername).mockReturnValue('stored-user');
    vi.mocked(authService.logout).mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId('logout-btn');
    act(() => {
      logoutBtn.click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(authService.logout).toHaveBeenCalled();
  });
});

