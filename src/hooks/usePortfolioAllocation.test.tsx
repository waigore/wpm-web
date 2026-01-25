import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolioAllocation } from './usePortfolioAllocation';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

// Mock services
vi.mock('../api/services/portfolioService', () => ({
  getPortfolioAllocation: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('usePortfolioAllocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch allocation data on mount', async () => {
    const mockResponse = {
      assets: [
        {
          ticker: 'AAPL',
          asset_type: 'Stock',
          quantity: 100,
          average_price: 150.0,
          cost_basis: 15000.0,
          cost_basis_method: 'fifo',
          current_price: 155.0,
          market_value: 15500.0,
          unrealized_gain_loss: 500.0,
          allocation_percentage: 50.0,
          realized_gain_loss: null,
          metadata: { sector: 'Technology', industry: 'Software' },
        },
        {
          ticker: 'MSFT',
          asset_type: 'Stock',
          quantity: 50,
          average_price: 300.0,
          cost_basis: 15000.0,
          cost_basis_method: 'fifo',
          current_price: 310.0,
          market_value: 15500.0,
          unrealized_gain_loss: 500.0,
          allocation_percentage: 50.0,
          realized_gain_loss: null,
          metadata: { sector: 'Technology', industry: 'Software' },
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePortfolioAllocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assets).toEqual(mockResponse.assets);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePortfolioAllocation(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getPortfolioAllocation).mockRejectedValue(error);

    const { result } = renderHook(() => usePortfolioAllocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.assets).toEqual([]);
  });

  it('should refetch when asset_types filter changes', async () => {
    const mockResponse = {
      assets: [
        {
          ticker: 'AAPL',
          asset_type: 'Stock',
          quantity: 100,
          average_price: 150.0,
          cost_basis: 15000.0,
          cost_basis_method: 'fifo',
          current_price: 155.0,
          market_value: 15500.0,
          unrealized_gain_loss: 500.0,
          allocation_percentage: 100.0,
          realized_gain_loss: null,
          metadata: null,
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue(mockResponse);

    const { result, rerender } = renderHook(
      (props) => usePortfolioAllocation(props),
      {
        wrapper,
        initialProps: { asset_types: ['Stock'] },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledWith({
      asset_types: 'Stock',
      tickers: null,
    });

    const initialCallCount = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls.length;

    // Change asset types filter
    rerender({ asset_types: ['ETF'] });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have been called again
    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledTimes(initialCallCount + 1);

    // Check that the last call includes ETF filter
    const lastCall = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls[
      vi.mocked(portfolioService.getPortfolioAllocation).mock.calls.length - 1
    ][0];
    expect(lastCall?.asset_types).toBe('ETF');
  });

  it('should refetch when tickers filter changes', async () => {
    const mockResponse = {
      assets: [
        {
          ticker: 'AAPL',
          asset_type: 'Stock',
          quantity: 100,
          average_price: 150.0,
          cost_basis: 15000.0,
          cost_basis_method: 'fifo',
          current_price: 155.0,
          market_value: 15500.0,
          unrealized_gain_loss: 500.0,
          allocation_percentage: 100.0,
          realized_gain_loss: null,
          metadata: null,
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue(mockResponse);

    const { result, rerender } = renderHook(
      (props) => usePortfolioAllocation(props),
      {
        wrapper,
        initialProps: { tickers: ['AAPL'] },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledWith({
      asset_types: null,
      tickers: 'AAPL',
    });

    const initialCallCount = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls.length;

    // Change tickers filter
    rerender({ tickers: ['MSFT', 'GOOGL'] });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have been called again
    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledTimes(initialCallCount + 1);

    // Check that the last call includes multiple tickers
    const lastCall = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls[
      vi.mocked(portfolioService.getPortfolioAllocation).mock.calls.length - 1
    ][0];
    expect(lastCall?.tickers).toBe('MSFT,GOOGL');
  });

  it('should convert empty arrays to null', async () => {
    const mockResponse = {
      assets: [],
    };

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => usePortfolioAllocation({ asset_types: [], tickers: [] }),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledWith({
      asset_types: null,
      tickers: null,
    });
  });

  it('should handle multiple filters', async () => {
    const mockResponse = {
      assets: [],
    };

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        usePortfolioAllocation({
          asset_types: ['Stock', 'ETF'],
          tickers: ['AAPL', 'MSFT'],
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledWith({
      asset_types: 'Stock,ETF',
      tickers: 'AAPL,MSFT',
    });
  });

  it('should handle refetch', async () => {
    const mockResponse = {
      assets: [
        {
          ticker: 'AAPL',
          asset_type: 'Stock',
          quantity: 100,
          average_price: 150.0,
          cost_basis: 15000.0,
          cost_basis_method: 'fifo',
          current_price: 155.0,
          market_value: 15500.0,
          unrealized_gain_loss: 500.0,
          allocation_percentage: 100.0,
          realized_gain_loss: null,
          metadata: null,
        },
      ],
    };

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePortfolioAllocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls.length;

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledTimes(callCount + 1);
  });

  it('should not fetch when not authenticated', async () => {
    // Mock auth service to return null (unauthenticated)
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    const { result } = renderHook(() => usePortfolioAllocation(), { wrapper });

    // Wait a bit to ensure useEffect has run
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not call the service when not authenticated
    expect(portfolioService.getPortfolioAllocation).not.toHaveBeenCalled();
    expect(result.current.assets).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
