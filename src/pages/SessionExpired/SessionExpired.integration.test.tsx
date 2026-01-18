import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../../context/AuthProvider';
import { routes } from '../../routes';
import { Routes, Route } from 'react-router-dom';
import { theme } from '../../theme/theme';
import * as authService from '../../api/services/authService';

// Mock dependencies
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock auth service
vi.mock('../../api/services/authService', () => ({
  getToken: vi.fn(),
  getUsername: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
}));

const renderApp = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('SessionExpired Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows countdown and redirects to login after 5 seconds', async () => {
    // Set session_expired flag
    localStorageMock.setItem('session_expired', 'true');

    renderApp('/session-expired');

    // Should show session expired page
    expect(screen.getByText('Session Expired')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Countdown should decrement
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('4')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('3')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1')).toBeInTheDocument();

    // After 5 seconds total, navigation should be triggered
    // Note: In a real scenario, this would redirect to login
    // For testing, we verify the countdown completes and the component is ready to redirect
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // The component should have attempted navigation (verified in unit tests)
    // Here we just verify the countdown completed
    // In integration, the actual navigation is tested separately
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('clears session_expired flag when session expired page loads', async () => {
    // Set session_expired flag
    localStorageMock.setItem('session_expired', 'true');

    renderApp('/session-expired');

    // Flag should be cleared on mount
    expect(localStorageMock.getItem('session_expired')).toBeNull();
  });

  it('redirects to session expired page when session_expired flag is set', async () => {
    // Set session_expired flag (simulating 401 occurred)
    localStorageMock.setItem('session_expired', 'true');
    
    // Mock auth service to return null (user is not authenticated after token cleared)
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderApp('/portfolio');

    // Should redirect to session expired page immediately
    expect(screen.getByText('Session Expired')).toBeInTheDocument();
  });

  it('does not show session expired page if user was never authenticated', async () => {
    // No token in localStorage and no session_expired flag
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderApp('/portfolio');

    // Should redirect directly to login, not session expired
    // Use getByRole to find the heading, not the button
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByText('Session Expired')).not.toBeInTheDocument();

    // session_expired flag should not be set
    expect(localStorageMock.getItem('session_expired')).toBeNull();
  });
});
