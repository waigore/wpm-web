import { useState, useEffect } from 'react';
import { getAssetTrades, AssetTradesParams } from '../api/services/portfolioService';
import type { Trade } from '../api/client';
import { useAuth } from './useAuth';

export interface UseAssetTradesReturn {
  trades: Trade[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssetTrades(
  ticker: string,
  params?: AssetTradesParams
): UseAssetTradesReturn {
  const { isAuthenticated } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page ?? 1);
  const [pageSize, setPageSize] = useState(params?.size ?? 20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    if (!isAuthenticated || !ticker) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiParams = {
        ...params,
        page: params?.page ?? currentPage,
        size: params?.size ?? pageSize,
      };
      const response = await getAssetTrades(ticker, apiParams);

      setTrades(response.trades.items || []);
      setTotalItems(response.trades.total || 0);
      setTotalPages(response.trades.pages || 0);
      setCurrentPage(response.trades.page || 1);
      setPageSize(response.trades.size || pageSize);
    } catch (err: any) {
      let errorMessage = 'Failed to fetch asset trades';
      
      if (err?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err?.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your parameters.';
      } else if (err?.response?.status === 404) {
        errorMessage = 'Asset not found. The ticker may be invalid or you may not have access to this asset.';
      } else if (err?.response?.status === 422) {
        errorMessage = 'Validation error. Please check your parameters.';
      } else if (err?.response?.status === 500) {
        errorMessage = 'Unable to load trade data. Please try again.';
      } else if (err?.message?.includes('Network Error') || err?.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, ticker, currentPage, pageSize, params?.page, params?.size, params?.sort_by, params?.sort_order, params?.start_date, params?.end_date]);

  const refetch = async () => {
    await fetchTrades();
  };

  return {
    trades,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    refetch,
  };
}

