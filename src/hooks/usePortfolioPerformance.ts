import { useState, useEffect } from 'react';
import { getPortfolioPerformance, PortfolioPerformanceParams } from '../api/services/portfolioService';
import type { PortfolioHistoryPoint } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UsePortfolioPerformanceReturn {
  historyPoints: PortfolioHistoryPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolioPerformance(
  params?: PortfolioPerformanceParams
): UsePortfolioPerformanceReturn {
  const { isAuthenticated } = useAuth();
  const [historyPoints, setHistoryPoints] = useState<PortfolioHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getPortfolioPerformance(params);

      setHistoryPoints(response.history_points || []);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch portfolio performance');
      setError(errorMessage);
      setHistoryPoints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, params?.start_date, params?.end_date, params?.granularity]);

  const refetch = async () => {
    await fetchPerformance();
  };

  return {
    historyPoints,
    loading,
    error,
    refetch,
  };
}
