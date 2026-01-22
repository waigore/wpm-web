import { useState, useEffect, useCallback } from 'react';
import { getAssetPriceHistory, AssetPriceHistoryParams } from '../api/services/portfolioService';
import type { AssetPriceHistoryResponse, PricePoint } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UseAssetPriceHistoryReturn {
  prices: PricePoint[];
  currentPrice: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssetPriceHistory(
  ticker: string,
  params?: AssetPriceHistoryParams
): UseAssetPriceHistoryReturn {
  const { isAuthenticated } = useAuth();
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceHistory = useCallback(async () => {
    if (!isAuthenticated || !ticker) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: AssetPriceHistoryResponse = await getAssetPriceHistory(ticker, params);
      setPrices(response.prices ?? []);
      setCurrentPrice(response.current_price ?? null);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch asset price history');
      setError(errorMessage);
      setPrices([]);
      setCurrentPrice(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, ticker, params?.start_date, params?.end_date]);

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  const refetch = useCallback(async () => {
    await fetchPriceHistory();
  }, [fetchPriceHistory]);

  return {
    prices,
    currentPrice,
    loading,
    error,
    refetch,
  };
}

