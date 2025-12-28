import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolio } from './usePortfolio';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

// Mock services
vi.mock('../api/services/portfolioService', () => ({
  getAllPositions: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('usePortfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch positions on mount', async () => {
    const mockResponse = {
      items: [
        {
          ticker: 'AAPL',
          asset_type: 'Stock',
          quantity: 100,
          average_price: 150.5,
          cost_basis: 15050,
          cost_basis_method: 'fifo' as const,
        },
      ],
      total: 1,
      page: 1,
      size: 50,
      pages: 1,
    };

    vi.mocked(portfolioService.getAllPositions).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.positions).toEqual(mockResponse.items);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(50);
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getAllPositions).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePortfolio(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAllPositions).mockRejectedValue(error);

    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.positions).toEqual([]);
  });

  it('should refetch on refetch call', async () => {
    const mockResponse = {
      items: [],
      total: 0,
      page: 1,
      size: 50,
      pages: 0,
    };

    vi.mocked(portfolioService.getAllPositions).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = vi.mocked(portfolioService.getAllPositions).mock.calls.length;

    await result.current.refetch();

    expect(portfolioService.getAllPositions).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it('should pass parameters to getAllPositions', async () => {
    const mockResponse = {
      items: [],
      total: 0,
      page: 2,
      size: 20,
      pages: 0,
    };

    vi.mocked(portfolioService.getAllPositions).mockResolvedValue(mockResponse);

    renderHook(
      () =>
        usePortfolio({
          page: 2,
          size: 20,
          sort_by: 'market_value',
          sort_order: 'desc',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(portfolioService.getAllPositions).toHaveBeenCalled();
    });

    expect(portfolioService.getAllPositions).toHaveBeenCalledWith({
      page: 2,
      size: 20,
      sort_by: 'market_value',
      sort_order: 'desc',
    });
  });

  it('should not fetch when not authenticated', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderHook(() => usePortfolio(), { wrapper });

    // Should not call getAllPositions when not authenticated
    expect(portfolioService.getAllPositions).not.toHaveBeenCalled();
  });
});

