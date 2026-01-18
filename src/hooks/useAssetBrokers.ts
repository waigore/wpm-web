import { useState, useEffect, useCallback } from 'react';
import { getAssetBrokers } from '../api/services/portfolioService';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UseAssetBrokersReturn {
  brokers: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssetBrokers(ticker: string): UseAssetBrokersReturn {
  const { isAuthenticated } = useAuth();
  const [brokers, setBrokers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrokers = useCallback(async () => {
    if (!isAuthenticated || !ticker) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAssetBrokers(ticker);
      setBrokers(response.brokers || []);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch asset brokers');
      setError(errorMessage);
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, ticker]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const refetch = useCallback(async () => {
    await fetchBrokers();
  }, [fetchBrokers]);

  return {
    brokers,
    loading,
    error,
    refetch,
  };
}
