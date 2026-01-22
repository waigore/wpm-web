import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatPercentage, formatQuantity } from './formatters';

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

  describe('formatQuantity', () => {
    it('preserves full precision for whole numbers', () => {
      expect(formatQuantity(100)).toBe('100');
    });

    it('preserves full precision for decimal numbers', () => {
      expect(formatQuantity(0.5)).toBe('0.5');
    });

    it('preserves full precision for numbers with many decimal places', () => {
      expect(formatQuantity(0.123456789)).toBe('0.123456789');
    });

    it('preserves full precision for very small numbers', () => {
      expect(formatQuantity(0.000001)).toBe('0.000001');
    });

    it('preserves full precision for large numbers', () => {
      expect(formatQuantity(1000000.123456)).toBe('1000000.123456');
    });

    it('returns N/A for null', () => {
      expect(formatQuantity(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(formatQuantity(undefined)).toBe('N/A');
    });

    it('handles zero', () => {
      expect(formatQuantity(0)).toBe('0');
    });
  });

});

