import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SessionExpired } from './SessionExpired';
import * as logger from '../../utils/logger';

// Mock dependencies
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
});

const renderSessionExpired = () => {
  return render(
    <BrowserRouter>
      <SessionExpired />
    </BrowserRouter>
  );
};

describe('SessionExpired', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders session expired message', () => {
    renderSessionExpired();

    expect(screen.getByText('Session Expired')).toBeInTheDocument();
    expect(screen.getByText(/Your session has expired. Redirecting to login.../i)).toBeInTheDocument();
  });

  it('displays initial countdown of 5', () => {
    renderSessionExpired();

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('decrements countdown every second', async () => {
    renderSessionExpired();

    // Initial countdown should be 5
    expect(screen.getByText('5')).toBeInTheDocument();

    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('4')).toBeInTheDocument();

    // Advance timer by another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('3')).toBeInTheDocument();

    // Advance timer by another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2')).toBeInTheDocument();

    // Advance timer by another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('redirects to login after 5 seconds', async () => {
    renderSessionExpired();

    // Advance timer by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('clears session_expired flag from localStorage on mount', () => {
    // Set the flag before rendering
    localStorageMock.setItem('session_expired', 'true');

    renderSessionExpired();

    // Flag should be cleared
    expect(localStorageMock.getItem('session_expired')).toBeNull();
  });

  it('logs session expiration on mount', () => {
    renderSessionExpired();

    expect(logger.default.info).toHaveBeenCalledWith(
      'Session expired, redirecting to login',
      { context: 'SessionExpired' }
    );
  });

  it('logs redirect when countdown completes', async () => {
    renderSessionExpired();

    // Advance timer by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(logger.default.info).toHaveBeenCalledWith(
      'Redirecting to login page',
      { context: 'SessionExpired' }
    );
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderSessionExpired();

    // Advance timer by 2 seconds
    vi.advanceTimersByTime(2000);

    // Unmount component
    unmount();

    // Advance timer further - navigate should not be called
    vi.advanceTimersByTime(3000);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    renderSessionExpired();

    const container = screen.getByLabelText('Session expired notification');
    expect(container).toBeInTheDocument();

    const countdown = screen.getByLabelText(/Redirecting in \d+ seconds/);
    expect(countdown).toBeInTheDocument();
    expect(countdown).toHaveAttribute('aria-live', 'polite');
  });

  it('updates aria-label with current countdown value', async () => {
    renderSessionExpired();

    // Initial countdown should have aria-label with 5
    let countdown = screen.getByLabelText('Redirecting in 5 seconds');
    expect(countdown).toBeInTheDocument();

    // Advance timer by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    countdown = screen.getByLabelText('Redirecting in 4 seconds');
    expect(countdown).toBeInTheDocument();
  });
});
