import { useState, useEffect } from 'react';
import { getAssetTradesAll, AssetTradesAllParams } from '../api/services/portfolioService';
import type { Trade } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UseAssetTradesAllReturn {
  trades: Trade[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssetTradesAll(
  ticker: string,
  params?: AssetTradesAllParams
): UseAssetTradesAllReturn {
  const { isAuthenticated } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    if (!isAuthenticated || !ticker) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAssetTradesAll(ticker, params);

      setTrades(response.trades || []);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch all asset trades');
      setError(errorMessage);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, ticker, params?.start_date, params?.end_date, params?.sort_by, params?.sort_order]);

  const refetch = async () => {
    await fetchTrades();
  };

  return {
    trades,
    loading,
    error,
    refetch,
  };
}
