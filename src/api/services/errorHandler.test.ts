import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handle401Error, SESSION_EXPIRED_FLAG, SESSION_EXPIRED_EVENT } from './errorHandler';
import { TOKEN_KEY, USER_KEY } from './authService';

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

describe('errorHandler', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('SESSION_EXPIRED_FLAG and SESSION_EXPIRED_EVENT', () => {
    it('should export SESSION_EXPIRED_FLAG constant', () => {
      expect(SESSION_EXPIRED_FLAG).toBe('session_expired');
    });

    it('should export SESSION_EXPIRED_EVENT constant', () => {
      expect(SESSION_EXPIRED_EVENT).toBe('session-expired');
    });
  });

  describe('handle401Error', () => {
    let eventListener: ((event: Event) => void) | null = null;
    let eventsDispatched: Event[] = [];

    beforeEach(() => {
      eventsDispatched = [];
      eventListener = (event: Event) => {
        eventsDispatched.push(event);
      };
      window.addEventListener(SESSION_EXPIRED_EVENT, eventListener);
    });

    afterEach(() => {
      if (eventListener) {
        window.removeEventListener(SESSION_EXPIRED_EVENT, eventListener);
      }
    });

    it('should handle Axios 401 error with token present', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');
      localStorageMock.setItem(USER_KEY, 'testuser');

      const axiosError = {
        response: {
          status: 401,
        },
      };

      handle401Error(axiosError);

      // Should clear token and user
      expect(localStorageMock.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorageMock.getItem(USER_KEY)).toBeNull();

      // Should set session expired flag
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBe('true');

      // Should dispatch custom event
      expect(eventsDispatched).toHaveLength(1);
      expect(eventsDispatched[0].type).toBe(SESSION_EXPIRED_EVENT);
    });

    it('should handle OpenAPI 401 error with token present', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');
      localStorageMock.setItem(USER_KEY, 'testuser');

      const openApiError = {
        status: 401,
      };

      handle401Error(openApiError);

      // Should clear token and user
      expect(localStorageMock.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorageMock.getItem(USER_KEY)).toBeNull();

      // Should set session expired flag
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBe('true');

      // Should dispatch custom event
      expect(eventsDispatched).toHaveLength(1);
      expect(eventsDispatched[0].type).toBe(SESSION_EXPIRED_EVENT);
    });

    it('should handle 401 error without token present (should not set flag)', () => {
      // No token in localStorage

      const axiosError = {
        response: {
          status: 401,
        },
      };

      handle401Error(axiosError);

      // Should clear token and user (even if they don't exist)
      expect(localStorageMock.getItem('auth_token')).toBeNull();
      expect(localStorageMock.getItem('auth_user')).toBeNull();

      // Should NOT set session expired flag (user was not authenticated)
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();

      // Should NOT dispatch custom event
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should not handle non-401 errors', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');
      localStorageMock.setItem(USER_KEY, 'testuser');

      const axiosError = {
        response: {
          status: 403, // Forbidden, not 401
        },
      };

      handle401Error(axiosError);

      // Should not clear token and user for non-401 errors
      expect(localStorageMock.getItem(TOKEN_KEY)).toBe('mock-token');
      expect(localStorageMock.getItem(USER_KEY)).toBe('testuser');

      // Should not set session expired flag
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();

      // Should not dispatch custom event
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle 500 error without modifying state', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');
      localStorageMock.setItem(USER_KEY, 'testuser');

      const axiosError = {
        response: {
          status: 500,
        },
      };

      handle401Error(axiosError);

      // Should not modify localStorage
      expect(localStorageMock.getItem(TOKEN_KEY)).toBe('mock-token');
      expect(localStorageMock.getItem(USER_KEY)).toBe('testuser');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle non-HTTP errors gracefully', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');

      const networkError = new Error('Network error');

      handle401Error(networkError);

      // Should not modify localStorage for non-HTTP errors
      expect(localStorageMock.getItem(TOKEN_KEY)).toBe('mock-token');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle null error gracefully', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');

      handle401Error(null);

      // Should not modify localStorage
      expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle undefined error gracefully', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');

      handle401Error(undefined);

      // Should not modify localStorage
      expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle error with missing response property', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');

      const errorWithMissingResponse = {
        message: 'Some error',
        // No response property
      };

      handle401Error(errorWithMissingResponse);

      // Should not modify localStorage
      expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle error with missing status in response', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');

      const errorWithoutStatus = {
        response: {
          // No status property
        },
      };

      handle401Error(errorWithoutStatus);

      // Should not modify localStorage
      expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should handle OpenAPI error with missing status', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');

      const openApiErrorWithoutStatus = {
        // No status property
        message: 'Some error',
      };

      handle401Error(openApiErrorWithoutStatus);

      // Should not modify localStorage
      expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBeNull();
      expect(eventsDispatched).toHaveLength(0);
    });

    it('should clear session_expired flag if it existed before when handling 401 with token', () => {
      localStorageMock.setItem(TOKEN_KEY, 'mock-token');
      localStorageMock.setItem(USER_KEY, 'testuser');
      localStorageMock.setItem(SESSION_EXPIRED_FLAG, 'false'); // Some old value

      const axiosError = {
        response: {
          status: 401,
        },
      };

      handle401Error(axiosError);

      // Should set flag to 'true'
      expect(localStorageMock.getItem(SESSION_EXPIRED_FLAG)).toBe('true');
    });
  });
});
