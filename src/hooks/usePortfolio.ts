import { useState, useEffect } from 'react';
import { getAllPositions, PortfolioParams } from '../api/services/portfolioService';
import type { Page_Position_, Position } from '../api/client';
import { useAuth } from './useAuth';

export interface UsePortfolioReturn {
  positions: Position[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolio(params?: PortfolioParams): UsePortfolioReturn {
  const { isAuthenticated } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page ?? 1);
  const [pageSize, setPageSize] = useState(params?.size ?? 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: Page_Position_ = await getAllPositions({
        ...params,
        page: currentPage,
        size: pageSize,
      });

      setPositions(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.pages || 0);
      setCurrentPage(response.page || 1);
      setPageSize(response.size || pageSize);
    } catch (err: any) {
      let errorMessage = 'Failed to fetch portfolio positions';
      
      if (err?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err?.response?.status === 400) {
        errorMessage = 'Invalid sort field. Please try again.';
      } else if (err?.response?.status === 422) {
        errorMessage = 'Validation error. Please check your parameters.';
      } else if (err?.response?.status === 500) {
        errorMessage = 'Unable to load portfolio data. Please try again.';
      } else if (err?.message?.includes('Network Error') || err?.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentPage, pageSize, params?.sort_by, params?.sort_order]);

  const refetch = async () => {
    await fetchPositions();
  };

  return {
    positions,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    refetch,
  };
}

