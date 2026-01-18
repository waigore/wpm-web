import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { apiClient } from './config';
import { handle401Error } from './services/errorHandler';
import { TOKEN_KEY } from './services/authService';
import { SESSION_EXPIRED_FLAG } from './services/errorHandler';

// Mock errorHandler
vi.mock('./services/errorHandler', () => ({
  handle401Error: vi.fn(),
  SESSION_EXPIRED_FLAG: 'session_expired',
  SESSION_EXPIRED_EVENT: 'session-expired',
}));

// Mock authService
vi.mock('./services/authService', () => ({
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
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
});

describe('apiClient configuration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('request interceptor', () => {
    it('should add Authorization header when token exists', () => {
      localStorageMock.setItem('auth_token', 'test-token-123');

      const config = {
        headers: {},
      };

      // Call the request interceptor manually
      const requestInterceptor = apiClient.interceptors.request.handlers[0]?.fulfilled;
      expect(requestInterceptor).toBeDefined();

      const result = requestInterceptor!(config as any);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should not add Authorization header when no token exists', () => {
      // No token in localStorage

      const config = {
        headers: {},
      };

      const requestInterceptor = apiClient.interceptors.request.handlers[0]?.fulfilled;
      expect(requestInterceptor).toBeDefined();

      const result = requestInterceptor!(config as any);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should preserve existing headers when adding Authorization', () => {
      localStorageMock.setItem('auth_token', 'test-token-123');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
      };

      const requestInterceptor = apiClient.interceptors.request.handlers[0]?.fulfilled;
      expect(requestInterceptor).toBeDefined();

      const result = requestInterceptor!(config as any);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['X-Custom-Header']).toBe('custom-value');
    });

    it('should return config unchanged when token is null', () => {
      localStorageMock.setItem('auth_token', ''); // Empty string should be treated as null

      const config = {
        headers: {},
      };

      const requestInterceptor = apiClient.interceptors.request.handlers[0]?.fulfilled;
      expect(requestInterceptor).toBeDefined();

      const result = requestInterceptor!(config as any);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('should pass through successful responses unchanged', () => {
      const response = {
        data: { result: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.fulfilled;
      expect(responseInterceptor).toBeDefined();

      const result = responseInterceptor!(response as any);

      expect(result).toBe(response);
      expect(handle401Error).not.toHaveBeenCalled();
    });

    it('should call handle401Error on 401 errors', async () => {
      localStorageMock.setItem('auth_token', 'test-token');
      localStorageMock.setItem('auth_user', 'testuser');

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;
      expect(responseInterceptor).toBeDefined();

      // The interceptor should call handle401Error and then re-throw
      await expect(responseInterceptor!(error as any)).rejects.toBe(error);

      expect(handle401Error).toHaveBeenCalledTimes(1);
      expect(handle401Error).toHaveBeenCalledWith(error);
    });

    it('should re-throw 401 errors after handling', async () => {
      const error = {
        response: {
          status: 401,
        },
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;
      expect(responseInterceptor).toBeDefined();

      await expect(responseInterceptor!(error as any)).rejects.toBe(error);
    });

    it('should call handle401Error on all errors (it handles non-401 internally)', async () => {
      const error = {
        response: {
          status: 403, // Forbidden, not 401
          data: { message: 'Forbidden' },
        },
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;
      expect(responseInterceptor).toBeDefined();

      await expect(responseInterceptor!(error as any)).rejects.toBe(error);

      // handle401Error is called for all errors, but only acts on 401
      expect(handle401Error).toHaveBeenCalledTimes(1);
      expect(handle401Error).toHaveBeenCalledWith(error);
    });

    it('should call handle401Error on network errors (it handles gracefully)', async () => {
      const error = {
        message: 'Network Error',
        // No response property
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;
      expect(responseInterceptor).toBeDefined();

      await expect(responseInterceptor!(error as any)).rejects.toBe(error);

      // handle401Error is called for all errors, but only acts on 401
      expect(handle401Error).toHaveBeenCalledTimes(1);
      expect(handle401Error).toHaveBeenCalledWith(error);
    });

    it('should call handle401Error on errors with missing response property', async () => {
      const error = {
        message: 'Some error',
        // No response property
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0]?.rejected;
      expect(responseInterceptor).toBeDefined();

      await expect(responseInterceptor!(error as any)).rejects.toBe(error);

      // handle401Error is called for all errors, but only acts on 401
      expect(handle401Error).toHaveBeenCalledTimes(1);
      expect(handle401Error).toHaveBeenCalledWith(error);
    });
  });

  describe('constants usage', () => {
    it('should use exported constants from authService and errorHandler', () => {
      // Verify that the constants are being used correctly
      // This is more of an integration check
      expect(TOKEN_KEY).toBe('auth_token');
      expect(SESSION_EXPIRED_FLAG).toBe('session_expired');
    });
  });
});
