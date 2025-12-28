import { describe, it, expect } from 'vitest';
import { validateUsername, validatePassword, validateLoginForm } from './validators';

describe('validators', () => {
  describe('validateUsername', () => {
    it('returns null for valid username', () => {
      expect(validateUsername('testuser')).toBeNull();
    });

    it('returns error for empty username', () => {
      expect(validateUsername('')).toBe('Username is required');
    });

    it('returns error for whitespace-only username', () => {
      expect(validateUsername('   ')).toBe('Username is required');
    });
  });

  describe('validatePassword', () => {
    it('returns null for valid password', () => {
      expect(validatePassword('password123')).toBeNull();
    });

    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });
  });

  describe('validateLoginForm', () => {
    it('returns empty array for valid form', () => {
      expect(validateLoginForm('user', 'pass')).toEqual([]);
    });

    it('returns error for empty username', () => {
      const errors = validateLoginForm('', 'pass');
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('username');
    });

    it('returns error for empty password', () => {
      const errors = validateLoginForm('user', '');
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('password');
    });

    it('returns errors for both fields', () => {
      const errors = validateLoginForm('', '');
      expect(errors).toHaveLength(2);
    });
  });
});

