import type { Trade } from '../api/client';

/**
 * Compare two trades to determine if they are the same trade.
 * Trades are considered equal if all fields match:
 * - date
 * - ticker
 * - action
 * - quantity
 * - price
 * - broker
 *
 * @param trade1 - First trade to compare
 * @param trade2 - Second trade to compare
 * @returns true if trades match, false otherwise
 */
export function tradeMatches(trade1: Trade, trade2: Trade): boolean {
  return (
    trade1.date === trade2.date &&
    trade1.ticker === trade2.ticker &&
    trade1.action === trade2.action &&
    trade1.quantity === trade2.quantity &&
    trade1.price === trade2.price &&
    trade1.broker === trade2.broker
  );
}

/**
 * Check if all trades in the first array are present in the second array.
 * Uses tradeMatches to compare trades.
 *
 * @param trades - Array of trades to check
 * @param visibleTrades - Array of visible trades to check against
 * @returns true if all trades are visible, false otherwise
 */
export function areAllTradesVisible(trades: Trade[], visibleTrades: Trade[]): boolean {
  if (trades.length === 0) {
    return true; // Empty array is considered "all visible"
  }

  return trades.every((trade) =>
    visibleTrades.some((visibleTrade) => tradeMatches(trade, visibleTrade))
  );
}

/**
 * Generate a unique key for a trade.
 * Useful for performance optimization when comparing large arrays of trades.
 *
 * @param trade - Trade to generate key for
 * @returns Unique string key for the trade
 */
export function getTradeKey(trade: Trade): string {
  return `${trade.date}|${trade.ticker}|${trade.action}|${trade.quantity}|${trade.price}|${trade.broker}`;
}
