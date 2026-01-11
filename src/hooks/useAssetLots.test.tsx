import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssetLots } from './useAssetLots';
import { AuthProvider } from '../context/AuthProvider';
import * as portfolioService from '../api/services/portfolioService';
import * as authService from '../api/services/authService';

// Mock services
vi.mock('../api/services/portfolioService', () => ({
  getAssetLots: vi.fn(),
}));

vi.mock('../api/services/authService', () => ({
  getToken: vi.fn(() => 'mock-token'),
  getUsername: vi.fn(() => 'testuser'),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAssetLots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('should fetch lots on mount', async () => {
    const mockResponse = {
      lots: {
        items: [
          {
            date: '2024-01-15',
            ticker: 'AAPL',
            asset_type: 'Stock',
            original_quantity: 50.0,
            remaining_quantity: 40.0,
            cost_basis: 7525.0,
            matched_sells: [],
          },
        ],
        total: 1,
        page: 1,
        size: 20,
        pages: 1,
      },
    };

    vi.mocked(portfolioService.getAssetLots).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetLots('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lots).toEqual(mockResponse.lots.items);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  it('should handle loading state', () => {
    vi.mocked(portfolioService.getAssetLots).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useAssetLots('AAPL'), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAssetLots).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetLots('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.lots).toEqual([]);
  });

  it('should handle 404 error', async () => {
    const error: any = new Error('Not found');
    error.response = { status: 404 };
    vi.mocked(portfolioService.getAssetLots).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetLots('INVALID'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Resource not found');
  });

  it('should handle 401 error', async () => {
    const error: any = new Error('Unauthorized');
    error.response = { status: 401 };
    vi.mocked(portfolioService.getAssetLots).mockRejectedValue(error);

    const { result } = renderHook(() => useAssetLots('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Authentication failed');
  });

  it('should refetch on refetch call', async () => {
    const mockResponse = {
      lots: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    };

    vi.mocked(portfolioService.getAssetLots).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetLots('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = vi.mocked(portfolioService.getAssetLots).mock.calls.length;

    await result.current.refetch();

    expect(portfolioService.getAssetLots).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it('should pass parameters to getAssetLots', async () => {
    const mockResponse = {
      lots: {
        items: [],
        total: 0,
        page: 2,
        size: 50,
        pages: 0,
      },
    };

    vi.mocked(portfolioService.getAssetLots).mockResolvedValue(mockResponse);

    renderHook(
      () =>
        useAssetLots('AAPL', {
          page: 2,
          size: 50,
          sort_by: 'cost_basis',
          sort_order: 'desc',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(portfolioService.getAssetLots).toHaveBeenCalled();
    });

    expect(portfolioService.getAssetLots).toHaveBeenCalledWith('AAPL', {
      page: 2,
      size: 50,
      sort_by: 'cost_basis',
      sort_order: 'desc',
    });
  });

  it('should not fetch when not authenticated', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderHook(() => useAssetLots('AAPL'), { wrapper });

    // Should not call getAssetLots when not authenticated
    expect(portfolioService.getAssetLots).not.toHaveBeenCalled();
  });

  it('should not fetch when ticker is empty', () => {
    renderHook(() => useAssetLots(''), { wrapper });

    // Should not call getAssetLots when ticker is empty
    expect(portfolioService.getAssetLots).not.toHaveBeenCalled();
  });

  it('should handle lots with matched sells', async () => {
    const mockResponse = {
      lots: {
        items: [
          {
            date: '2024-01-15',
            ticker: 'AAPL',
            asset_type: 'Stock',
            original_quantity: 50.0,
            remaining_quantity: 40.0,
            cost_basis: 7525.0,
            matched_sells: [
              {
                trade: {
                  date: '2024-03-05',
                  ticker: 'AAPL',
                  asset_type: 'Stock',
                  action: 'Sell',
                  order_instruction: 'limit',
                  quantity: 10.0,
                  price: 160.00,
                  broker: 'Fidelity',
                },
                consumed_quantity: 10.0,
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        size: 20,
        pages: 1,
      },
    };

    vi.mocked(portfolioService.getAssetLots).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAssetLots('AAPL'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lots).toEqual(mockResponse.lots.items);
    expect(result.current.lots[0].matched_sells?.length).toBe(1);
  });
});






