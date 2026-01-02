import { describe, it, expect } from 'vitest';
import { extractErrorMessage } from './errorHelpers';

describe('errorHelpers', () => {
  describe('extractErrorMessage', () => {
    it('returns default message for null', () => {
      expect(extractErrorMessage(null)).toBe('An error occurred');
    });

    it('returns default message for undefined', () => {
      expect(extractErrorMessage(undefined)).toBe('An error occurred');
    });

    it('returns custom default message', () => {
      expect(extractErrorMessage(null, 'Custom error')).toBe('Custom error');
    });

    it('handles HTTP 401 error', () => {
      const error = {
        response: {
          status: 401,
        },
      };
      expect(extractErrorMessage(error)).toBe('Authentication failed. Please login again.');
    });

    it('handles HTTP 400 error', () => {
      const error = {
        response: {
          status: 400,
        },
      };
      expect(extractErrorMessage(error)).toBe('Invalid request. Please check your parameters.');
    });

    it('handles HTTP 404 error', () => {
      const error = {
        response: {
          status: 404,
        },
      };
      expect(extractErrorMessage(error)).toBe('Resource not found.');
    });

    it('handles HTTP 422 error', () => {
      const error = {
        response: {
          status: 422,
        },
      };
      expect(extractErrorMessage(error)).toBe('Validation error. Please check your parameters.');
    });

    it('handles HTTP 500 error', () => {
      const error = {
        response: {
          status: 500,
        },
      };
      expect(extractErrorMessage(error)).toBe('Server error. Please try again.');
    });

    it('handles Error instance with message', () => {
      const error = new Error('Something went wrong');
      expect(extractErrorMessage(error)).toBe('Something went wrong');
    });

    it('handles Error instance with Network Error message', () => {
      const error = new Error('Network Error');
      expect(extractErrorMessage(error)).toBe('Network error. Please check your connection.');
    });

    it('handles error object with ERR_NETWORK code', () => {
      const error = {
        code: 'ERR_NETWORK',
        message: 'Network request failed',
      };
      expect(extractErrorMessage(error)).toBe('Network error. Please check your connection.');
    });

    it('handles error object with Network Error in message', () => {
      const error = {
        message: 'Network Error: Failed to connect',
      };
      expect(extractErrorMessage(error)).toBe('Network error. Please check your connection.');
    });

    it('handles error object with message property', () => {
      const error = {
        message: 'Custom error message',
      };
      expect(extractErrorMessage(error)).toBe('Custom error message');
    });

    it('handles error object with response but no status', () => {
      const error = {
        response: {},
      };
      expect(extractErrorMessage(error, 'Default message')).toBe('Default message');
    });

    it('handles unknown HTTP status code', () => {
      const error = {
        response: {
          status: 503,
        },
      };
      expect(extractErrorMessage(error, 'Service unavailable')).toBe('Service unavailable');
    });

    it('handles error object with both code and message', () => {
      const error = {
        code: 'ERR_NETWORK',
        message: 'Some other message',
      };
      // Network error should take precedence
      expect(extractErrorMessage(error)).toBe('Network error. Please check your connection.');
    });

    it('handles empty object', () => {
      expect(extractErrorMessage({}, 'Empty error')).toBe('Empty error');
    });

    it('handles string error (should fall through to default)', () => {
      expect(extractErrorMessage('string error', 'Default')).toBe('Default');
    });

    it('handles number error (should fall through to default)', () => {
      expect(extractErrorMessage(123, 'Default')).toBe('Default');
    });
  });
});

