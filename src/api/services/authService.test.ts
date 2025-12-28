import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, logout, getToken, getUsername } from './authService';
import { DefaultService } from '../client/services/DefaultService';
import { OpenAPI } from '../client/core/OpenAPI';

// Mock the API client
vi.mock('../client/services/DefaultService', () => ({
  DefaultService: {
    loginLoginPost: vi.fn(),
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
});

describe('authService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    OpenAPI.TOKEN = undefined;
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        access_token: 'mock-token-123',
        token_type: 'bearer',
      };

      vi.mocked(DefaultService.loginLoginPost).mockResolvedValue(mockResponse);

      const result = await login('testuser', 'password123');

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('mock-token-123');
      expect(localStorage.getItem('auth_user')).toBe('testuser');
      expect(OpenAPI.TOKEN).toBe('mock-token-123');
      expect(DefaultService.loginLoginPost).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should not store token if response has no access_token', async () => {
      const mockResponse = {
        access_token: '',
        token_type: 'bearer',
      };

      vi.mocked(DefaultService.loginLoginPost).mockResolvedValue(mockResponse);

      await login('testuser', 'password123');

      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear token and user from localStorage', () => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('auth_user', 'testuser');
      OpenAPI.TOKEN = 'mock-token';

      logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(OpenAPI.TOKEN).toBeUndefined();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'mock-token-456');

      const token = getToken();

      expect(token).toBe('mock-token-456');
      expect(OpenAPI.TOKEN).toBe('mock-token-456');
    });

    it('should return null if no token exists', () => {
      const token = getToken();

      expect(token).toBeNull();
    });

    it('should set OpenAPI.TOKEN when token exists', () => {
      localStorage.setItem('auth_token', 'mock-token-789');
      OpenAPI.TOKEN = undefined;

      getToken();

      expect(OpenAPI.TOKEN).toBe('mock-token-789');
    });
  });

  describe('getUsername', () => {
    it('should return username from localStorage', () => {
      localStorage.setItem('auth_user', 'testuser');

      const username = getUsername();

      expect(username).toBe('testuser');
    });

    it('should return null if no username exists', () => {
      const username = getUsername();

      expect(username).toBeNull();
    });
  });
});

