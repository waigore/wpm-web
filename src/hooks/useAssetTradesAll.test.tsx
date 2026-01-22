import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetTradesAll } from './useAssetTradesAll';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

// Mock services
vi.mock('../api/services/portfolioService', () => ({
  getAssetTradesAll: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAssetTradesAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch trades on mount', async () => {
    const mockResponse = {
      trades: [
        {
          date: '2024-01-15',
          ticker: 'AAPL',
          asset_type: 'Stock',
          action: 'Buy',
          order_instruction: 'limit',
          quantity: 50.0,
          price: 150.50,
          broker: 'Fidelity',
        },
      ],
    };

    vi.mocked(portfolioService.getAssetTradesAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetTradesAll('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trades).toEqual(mockResponse.trades);
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getAssetTradesAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useAssetTradesAll('AAPL'), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAssetTradesAll).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetTradesAll('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.trades).toEqual([]);
  });

  it('should handle 404 error', async () => {
    const error: any = new Error('Not found');
    error.response = { status: 404 };
    vi.mocked(portfolioService.getAssetTradesAll).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetTradesAll('INVALID'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Resource not found');
  });

  it('should handle 401 error', async () => {
    const error: any = new Error('Unauthorized');
    error.response = { status: 401 };
    vi.mocked(portfolioService.getAssetTradesAll).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetTradesAll('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Authentication failed');
  });

  it('should refetch on refetch call', async () => {
    const mockResponse = {
      trades: [],
    };

    vi.mocked(portfolioService.getAssetTradesAll).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetTradesAll('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = vi.mocked(portfolioService.getAssetTradesAll).mock.calls.length;

    await result.current.refetch();

    expect(portfolioService.getAssetTradesAll).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it('should pass parameters to getAssetTradesAll', async () => {
    const mockResponse = {
      trades: [],
    };

    vi.mocked(portfolioService.getAssetTradesAll).mockResolvedValue(mockResponse);

    renderHook(
      () =>
        useAssetTradesAll('AAPL', {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          sort_by: 'price',
          sort_order: 'desc',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(portfolioService.getAssetTradesAll).toHaveBeenCalled();
    });

    expect(portfolioService.getAssetTradesAll).toHaveBeenCalledWith('AAPL', {
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      sort_by: 'price',
      sort_order: 'desc',
    });
  });

  it('should refetch when params change', async () => {
    const mockResponse = {
      trades: [],
    };

    vi.mocked(portfolioService.getAssetTradesAll).mockResolvedValue(mockResponse);

    const { rerender } = renderHook(
      ({ startDate }) => useAssetTradesAll('AAPL', { start_date: startDate }),
      {
        wrapper,
        initialProps: { startDate: '2024-01-01' },
      }
    );

    await waitFor(() => {
      expect(portfolioService.getAssetTradesAll).toHaveBeenCalled();
    });

    const initialCallCount = vi.mocked(portfolioService.getAssetTradesAll).mock.calls.length;

    rerender({ startDate: '2024-06-01' });

    await waitFor(() => {
      expect(portfolioService.getAssetTradesAll).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });

  it('should not fetch when not authenticated', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderHook(() => useAssetTradesAll('AAPL'), { wrapper });

    // Should not call getAssetTradesAll when not authenticated
    expect(portfolioService.getAssetTradesAll).not.toHaveBeenCalled();
  });

  it('should not fetch when ticker is empty', () => {
    renderHook(() => useAssetTradesAll(''), { wrapper });

    // Should not call getAssetTradesAll when ticker is empty
    expect(portfolioService.getAssetTradesAll).not.toHaveBeenCalled();
  });
});
