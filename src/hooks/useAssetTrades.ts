import { useState, useEffect } from 'react';
import { getAssetTrades, AssetTradesParams } from '../api/services/portfolioService';
import type { Trade } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

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
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch asset trades');
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

