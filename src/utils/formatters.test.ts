import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatPercentage } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats number as USD currency', () => {
      expect(formatCurrency(1234.56)).toMatch(/\$1,234\.56/);
    });

    it('returns N/A for null', () => {
      expect(formatCurrency(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatCurrency(undefined)).toBe('N/A');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toMatch(/\$0\.00/);
    });
  });

  describe('formatNumber', () => {
    it('formats number with default decimals', () => {
      expect(formatNumber(1234.567)).toBe('1,234.57');
    });

    it('formats number with custom decimals', () => {
      expect(formatNumber(1234.567, 1)).toBe('1,234.6');
    });

    it('returns N/A for null', () => {
      expect(formatNumber(null)).toBe('N/A');
    });
  });

  describe('formatPercentage', () => {
    it('formats number as percentage', () => {
      expect(formatPercentage(5.23)).toMatch(/\+5\.23%/);
    });

    it('formats negative number as percentage', () => {
      expect(formatPercentage(-5.23)).toMatch(/-5\.23%/);
    });

    it('returns N/A for null', () => {
      expect(formatPercentage(null)).toBe('N/A');
    });
  });
});

