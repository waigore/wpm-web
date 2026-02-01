import { useState, useEffect, useCallback } from 'react';
import {
  getReferencePerformance,
  ReferencePerformanceParams,
} from '../api/services/portfolioService';
import type { PortfolioHistoryPoint } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UseReferencePerformanceParams extends ReferencePerformanceParams {
  ticker: string;
}

export interface UseReferencePerformanceReturn {
  historyPoints: PortfolioHistoryPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReferencePerformance(
  params: UseReferencePerformanceParams
): UseReferencePerformanceReturn {
  const { isAuthenticated } = useAuth();
  const [historyPoints, setHistoryPoints] = useState<PortfolioHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const { ticker, ...rest } = params;
    setLoading(true);
    setError(null);

    try {
      const response = await getReferencePerformance(ticker, rest);
      setHistoryPoints(response.history_points || []);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(
        err,
        'Failed to fetch reference performance'
      );
      setError(errorMessage);
      setHistoryPoints([]);
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    params.ticker,
    params.asset_type,
    params.start_date,
    params.end_date,
    params.granularity,
  ]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const refetch = useCallback(async () => {
    await fetchPerformance();
  }, [fetchPerformance]);

  return {
    historyPoints,
    loading,
    error,
    refetch,
  };
}
