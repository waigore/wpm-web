import { describe, it, expect } from 'vitest';
import { getGainLossColor, getActionColor } from './colorHelpers';

describe('colorHelpers', () => {
  describe('getGainLossColor', () => {
    it('returns success.main for positive values', () => {
      expect(getGainLossColor(100)).toBe('success.main');
      expect(getGainLossColor(0.01)).toBe('success.main');
      expect(getGainLossColor(1000000)).toBe('success.main');
    });

    it('returns error.main for negative values', () => {
      expect(getGainLossColor(-100)).toBe('error.main');
      expect(getGainLossColor(-0.01)).toBe('error.main');
      expect(getGainLossColor(-1000000)).toBe('error.main');
    });

    it('returns inherit for zero', () => {
      expect(getGainLossColor(0)).toBe('inherit');
    });

    it('returns inherit for null', () => {
      expect(getGainLossColor(null)).toBe('inherit');
    });

    it('returns inherit for undefined', () => {
      expect(getGainLossColor(undefined)).toBe('inherit');
    });
  });

  describe('getActionColor', () => {
    it('returns success.main for Buy action', () => {
      expect(getActionColor('Buy')).toBe('success.main');
    });

    it('returns error.main for Sell action', () => {
      expect(getActionColor('Sell')).toBe('error.main');
    });

    it('returns inherit for other actions', () => {
      expect(getActionColor('Hold')).toBe('inherit');
      expect(getActionColor('')).toBe('inherit');
      expect(getActionColor('Unknown')).toBe('inherit');
    });

    it('is case-sensitive', () => {
      expect(getActionColor('buy')).toBe('inherit');
      expect(getActionColor('BUY')).toBe('inherit');
      expect(getActionColor('sell')).toBe('inherit');
      expect(getActionColor('SELL')).toBe('inherit');
    });
  });
});

