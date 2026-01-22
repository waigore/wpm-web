import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetPriceHistory } from './useAssetPriceHistory';
import * as portfolioService from '../api/services/portfolioService';
import * as useAuthHook from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

vi.mock('../api/services/portfolioService', () => ({
  getAssetPriceHistory: vi.fn(),
}));

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../utils/errorHelpers', () => ({
  extractErrorMessage: vi.fn().mockReturnValue('Failed to fetch asset price history'),
}));

describe('useAssetPriceHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches price history when authenticated', async () => {
    const mockResponse = {
      ticker: 'AAPL',
      asset_type: 'Stock',
      prices: [
        { date: '2025-01-02', price: 170.25 },
        { date: '2025-01-03', price: 171.1 },
      ],
      current_price: 171.1,
    };

    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: 'testuser',
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(portfolioService.getAssetPriceHistory).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() =>
      useAssetPriceHistory('AAPL', { start_date: '2025-01-01', end_date: '2025-01-31' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.prices).toHaveLength(2);
    expect(result.current.currentPrice).toBe(171.1);
    expect(portfolioService.getAssetPriceHistory).toHaveBeenCalledWith('AAPL', {
      start_date: '2025-01-01',
      end_date: '2025-01-31',
    });
  });

  it('does not fetch when not authenticated', async () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() =>
      useAssetPriceHistory('AAPL', { start_date: '2025-01-01', end_date: '2025-01-31' })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getAssetPriceHistory).not.toHaveBeenCalled();
    expect(result.current.prices).toEqual([]);
    expect(result.current.currentPrice).toBeNull();
  });

  it('handles errors from service', async () => {
    const error = new Error('Network error');

    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: 'testuser',
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(portfolioService.getAssetPriceHistory).mockRejectedValue(error);
    vi.mocked(extractErrorMessage).mockReturnValue('Failed to fetch asset price history');

    const { result } = renderHook(() => useAssetPriceHistory('AAPL'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch asset price history');
    expect(result.current.prices).toEqual([]);
    expect(result.current.currentPrice).toBeNull();
  });
});

