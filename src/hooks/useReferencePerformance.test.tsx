import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReferencePerformance } from './useReferencePerformance';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

vi.mock('../api/services/portfolioService', () => ({
  getReferencePerformance: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const defaultParams = {
  ticker: 'SPY',
  asset_type: 'ETF',
  start_date: null as string | null,
  end_date: null as string | null,
  granularity: 'weekly' as const,
};

describe('useReferencePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch reference performance on mount', async () => {
    const mockResponse = {
      history_points: [
        {
          date: '2024-01-01',
          total_market_value: 100000.0,
          asset_positions: { SPY: 100000.0 },
          prices: { SPY: 400.0 },
          percentage_return: 0,
        },
      ],
    };

    vi.mocked(portfolioService.getReferencePerformance).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useReferencePerformance({ ...defaultParams }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.historyPoints).toEqual(mockResponse.history_points);
    expect(result.current.error).toBeNull();
    expect(portfolioService.getReferencePerformance).toHaveBeenCalledWith(
      'SPY',
      expect.objectContaining({
        asset_type: 'ETF',
        granularity: 'weekly',
      })
    );
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getReferencePerformance).mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(
      () => useReferencePerformance({ ...defaultParams }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch reference');
    vi.mocked(portfolioService.getReferencePerformance).mockRejectedValue(error);

    const { result } = renderHook(
      () => useReferencePerformance({ ...defaultParams }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.historyPoints).toEqual([]);
  });

  it('should refetch when parameters change', async () => {
    const mockResponse = {
      history_points: [
        {
          date: '2024-01-01',
          total_market_value: 100000.0,
          asset_positions: { SPY: 100000.0 },
          prices: { SPY: 400.0 },
          percentage_return: 0,
        },
      ],
    };

    vi.mocked(portfolioService.getReferencePerformance).mockResolvedValue(mockResponse);

    const { result, rerender } = renderHook(
      (props) => useReferencePerformance(props),
      {
        wrapper,
        initialProps: { ...defaultParams, granularity: 'daily' as const },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = vi.mocked(portfolioService.getReferencePerformance).mock.calls.length;

    rerender({ ...defaultParams, granularity: 'monthly' as const });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getReferencePerformance).toHaveBeenCalledTimes(initialCallCount + 1);
    const lastCall = vi.mocked(portfolioService.getReferencePerformance).mock.calls[
      vi.mocked(portfolioService.getReferencePerformance).mock.calls.length - 1
    ];
    expect(lastCall[1]?.granularity).toBe('monthly');
  });

  it('should handle refetch', async () => {
    const mockResponse = {
      history_points: [
        {
          date: '2024-01-01',
          total_market_value: 100000.0,
          asset_positions: { SPY: 100000.0 },
          prices: { SPY: 400.0 },
          percentage_return: 0,
        },
      ],
    };

    vi.mocked(portfolioService.getReferencePerformance).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useReferencePerformance({ ...defaultParams }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = vi.mocked(portfolioService.getReferencePerformance).mock.calls.length;

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getReferencePerformance).toHaveBeenCalledTimes(callCount + 1);
  });

  it('should fetch BTC-USD reference performance with Crypto asset type', async () => {
    const mockResponse = {
      history_points: [
        {
          date: '2024-01-01',
          total_market_value: 95000.0,
          asset_positions: { 'BTC-USD': 95000.0 },
          prices: { 'BTC-USD': 42000.0 },
          percentage_return: 0,
        },
      ],
    };

    vi.mocked(portfolioService.getReferencePerformance).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        useReferencePerformance({
          ticker: 'BTC-USD',
          asset_type: 'Crypto',
          start_date: null,
          end_date: null,
          granularity: 'weekly',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.historyPoints).toEqual(mockResponse.history_points);
    expect(result.current.error).toBeNull();
    expect(portfolioService.getReferencePerformance).toHaveBeenCalledWith(
      'BTC-USD',
      expect.objectContaining({
        asset_type: 'Crypto',
        granularity: 'weekly',
      })
    );
  });

  it('should not fetch when not authenticated', async () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    const { result } = renderHook(
      () => useReferencePerformance({ ...defaultParams }),
      { wrapper }
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(portfolioService.getReferencePerformance).not.toHaveBeenCalled();
    expect(result.current.historyPoints).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
