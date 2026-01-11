import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolioPerformance } from './usePortfolioPerformance';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

// Mock services
vi.mock('../api/services/portfolioService', () => ({
  getPortfolioPerformance: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('usePortfolioPerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch performance data on mount', async () => {
    const mockResponse = {
      history_points: [
        {
          date: '2024-01-01',
          total_market_value: 100000.0,
          asset_positions: { AAPL: 5000.0 },
          prices: { AAPL: 150.0 },
        },
        {
          date: '2024-01-15',
          total_market_value: 105000.0,
          asset_positions: { AAPL: 5500.0 },
          prices: { AAPL: 155.0 },
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePortfolioPerformance(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.historyPoints).toEqual(mockResponse.history_points);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePortfolioPerformance(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getPortfolioPerformance).mockRejectedValue(error);

    const { result } = renderHook(() => usePortfolioPerformance(), { wrapper });

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
          asset_positions: { AAPL: 5000.0 },
          prices: { AAPL: 150.0 },
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue(mockResponse);

    const { result, rerender } = renderHook(
      (props) => usePortfolioPerformance(props),
      {
        wrapper,
        initialProps: { granularity: 'daily' as const },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledWith(
      expect.objectContaining({
        granularity: 'daily',
      })
    );

    const initialCallCount = vi.mocked(portfolioService.getPortfolioPerformance).mock.calls.length;

    // Change granularity
    rerender({ granularity: 'weekly' as const });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have been called again
    expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledTimes(initialCallCount + 1);

    // Check that the last call includes weekly granularity
    const lastCall = vi.mocked(portfolioService.getPortfolioPerformance).mock.calls[
      vi.mocked(portfolioService.getPortfolioPerformance).mock.calls.length - 1
    ][0];
    expect(lastCall?.granularity).toBe('weekly');
  });

  it('should handle date range parameters', async () => {
    const mockResponse = {
      history_points: [],
    };

    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        usePortfolioPerformance({
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          granularity: 'daily',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledWith({
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      granularity: 'daily',
    });
  });

  it('should handle refetch', async () => {
    const mockResponse = {
      history_points: [
        {
          date: '2024-01-01',
          total_market_value: 100000.0,
          asset_positions: { AAPL: 5000.0 },
          prices: { AAPL: 150.0 },
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePortfolioPerformance(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = vi.mocked(portfolioService.getPortfolioPerformance).mock.calls.length;

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledTimes(callCount + 1);
  });

  it('should not fetch when not authenticated', async () => {
    // Mock auth service to return null (unauthenticated)
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    const { result } = renderHook(() => usePortfolioPerformance(), { wrapper });

    // Wait a bit to ensure useEffect has run
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not call the service when not authenticated
    expect(portfolioService.getPortfolioPerformance).not.toHaveBeenCalled();
    expect(result.current.historyPoints).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
