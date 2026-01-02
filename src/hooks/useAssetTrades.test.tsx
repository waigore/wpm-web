import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetTrades } from './useAssetTrades';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

// Mock services
vi.mock('../api/services/portfolioService', () => ({
  getAssetTrades: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAssetTrades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch trades on mount', async () => {
    const mockResponse = {
      trades: {
        items: [
          {
            date: '2024-01-15',
            ticker: 'AAPL',
            asset_type: 'Stock',
            order_instruction: 'buy',
            quantity: 50.0,
            price: 150.50,
            cost_basis: 7525.0,
            market_price: 175.25,
            unrealized_profit_loss: 1237.5,
          },
        ],
        total: 1,
        page: 1,
        size: 20,
        pages: 1,
      },
    };

    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetTrades('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trades).toEqual(mockResponse.trades.items);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getAssetTrades).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useAssetTrades('AAPL'), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAssetTrades).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetTrades('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.trades).toEqual([]);
  });

  it('should handle 404 error', async () => {
    const error: any = new Error('Not found');
    error.response = { status: 404 };
    vi.mocked(portfolioService.getAssetTrades).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetTrades('INVALID'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Resource not found');
  });

  it('should handle 401 error', async () => {
    const error: any = new Error('Unauthorized');
    error.response = { status: 401 };
    vi.mocked(portfolioService.getAssetTrades).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetTrades('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Authentication failed');
  });

  it('should refetch on refetch call', async () => {
    const mockResponse = {
      trades: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    };

    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetTrades('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = vi.mocked(portfolioService.getAssetTrades).mock.calls.length;

    await result.current.refetch();

    expect(portfolioService.getAssetTrades).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it('should pass parameters to getAssetTrades', async () => {
    const mockResponse = {
      trades: {
        items: [],
        total: 0,
        page: 2,
        size: 50,
        pages: 0,
      },
    };

    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue(mockResponse);

    renderHook(
      () =>
        useAssetTrades('AAPL', {
          page: 2,
          size: 50,
          sort_by: 'price',
          sort_order: 'desc',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(portfolioService.getAssetTrades).toHaveBeenCalled();
    });

    expect(portfolioService.getAssetTrades).toHaveBeenCalledWith('AAPL', {
      page: 2,
      size: 50,
      sort_by: 'price',
      sort_order: 'desc',
    });
  });

  it('should not fetch when not authenticated', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderHook(() => useAssetTrades('AAPL'), { wrapper });

    // Should not call getAssetTrades when not authenticated
    expect(portfolioService.getAssetTrades).not.toHaveBeenCalled();
  });

  it('should not fetch when ticker is empty', () => {
    renderHook(() => useAssetTrades(''), { wrapper });

    // Should not call getAssetTrades when ticker is empty
    expect(portfolioService.getAssetTrades).not.toHaveBeenCalled();
  });
});

