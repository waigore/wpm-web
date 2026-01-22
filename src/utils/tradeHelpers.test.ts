import { describe, it, expect } from 'vitest';
import { tradeMatches, areAllTradesVisible, getTradeKey } from './tradeHelpers';
import type { Trade } from '../api/client';

const mockTrade1: Trade = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  action: 'Buy',
  order_instruction: 'limit',
  quantity: 50.0,
  price: 150.50,
  broker: 'Fidelity',
};

const mockTrade2: Trade = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  action: 'Buy',
  order_instruction: 'limit',
  quantity: 50.0,
  price: 150.50,
  broker: 'Fidelity',
};

const mockTrade3: Trade = {
  date: '2024-02-10',
  ticker: 'AAPL',
  asset_type: 'Stock',
  action: 'Buy',
  order_instruction: 'market',
  quantity: 50.0,
  price: 150.50,
  broker: 'Charles Schwab',
};

describe('tradeHelpers', () => {
  describe('tradeMatches', () => {
    it('should return true for identical trades', () => {
      expect(tradeMatches(mockTrade1, mockTrade2)).toBe(true);
    });

    it('should return false for trades with different dates', () => {
      const differentDate = { ...mockTrade1, date: '2024-01-16' };
      expect(tradeMatches(mockTrade1, differentDate)).toBe(false);
    });

    it('should return false for trades with different tickers', () => {
      const differentTicker = { ...mockTrade1, ticker: 'GOOGL' };
      expect(tradeMatches(mockTrade1, differentTicker)).toBe(false);
    });

    it('should return false for trades with different actions', () => {
      const differentAction = { ...mockTrade1, action: 'Sell' };
      expect(tradeMatches(mockTrade1, differentAction)).toBe(false);
    });

    it('should return false for trades with different quantities', () => {
      const differentQuantity = { ...mockTrade1, quantity: 100.0 };
      expect(tradeMatches(mockTrade1, differentQuantity)).toBe(false);
    });

    it('should return false for trades with different prices', () => {
      const differentPrice = { ...mockTrade1, price: 200.0 };
      expect(tradeMatches(mockTrade1, differentPrice)).toBe(false);
    });

    it('should return false for trades with different brokers', () => {
      const differentBroker = { ...mockTrade1, broker: 'TD Ameritrade' };
      expect(tradeMatches(mockTrade1, differentBroker)).toBe(false);
    });

    it('should ignore asset_type and order_instruction when comparing', () => {
      const differentAssetType = { ...mockTrade1, asset_type: 'Crypto' };
      const differentOrderInstruction = { ...mockTrade1, order_instruction: 'market' };
      expect(tradeMatches(mockTrade1, differentAssetType)).toBe(true);
      expect(tradeMatches(mockTrade1, differentOrderInstruction)).toBe(true);
    });
  });

  describe('areAllTradesVisible', () => {
    it('should return true when all trades are visible', () => {
      const trades = [mockTrade1, mockTrade2];
      const visibleTrades = [mockTrade1, mockTrade2, mockTrade3];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(true);
    });

    it('should return false when some trades are not visible', () => {
      const trades = [mockTrade1, mockTrade3];
      const visibleTrades = [mockTrade1];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(false);
    });

    it('should return false when no trades are visible', () => {
      const trades = [mockTrade1, mockTrade2];
      const visibleTrades = [mockTrade3];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(false);
    });

    it('should return true for empty trades array', () => {
      const trades: Trade[] = [];
      const visibleTrades = [mockTrade1, mockTrade2];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(true);
    });

    it('should return true when trades array is empty and visibleTrades is empty', () => {
      const trades: Trade[] = [];
      const visibleTrades: Trade[] = [];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(true);
    });

    it('should return false when trades array has items but visibleTrades is empty', () => {
      const trades = [mockTrade1];
      const visibleTrades: Trade[] = [];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(false);
    });

    it('should handle duplicate trades correctly', () => {
      const trades = [mockTrade1, mockTrade1];
      const visibleTrades = [mockTrade1];
      expect(areAllTradesVisible(trades, visibleTrades)).toBe(true);
    });
  });

  describe('getTradeKey', () => {
    it('should generate a unique key for a trade', () => {
      const key1 = getTradeKey(mockTrade1);
      const key2 = getTradeKey(mockTrade2);
      const key3 = getTradeKey(mockTrade3);

      expect(key1).toBe('2024-01-15|AAPL|Buy|50|150.5|Fidelity');
      expect(key1).toBe(key2); // Same trade should have same key
      expect(key1).not.toBe(key3); // Different trade should have different key
    });

    it('should generate consistent keys for the same trade', () => {
      const key1 = getTradeKey(mockTrade1);
      const key2 = getTradeKey(mockTrade1);
      expect(key1).toBe(key2);
    });
  });
});
