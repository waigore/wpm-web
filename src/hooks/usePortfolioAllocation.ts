import { useState, useEffect, useCallback } from 'react';
import { getPortfolioAllocation, PortfolioAllocationParams } from '../api/services/portfolioService';
import type { AllocationPosition } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';
import logger from '../utils/logger';

export interface UsePortfolioAllocationParams {
  asset_types?: string[];
  tickers?: string[];
}

export interface UsePortfolioAllocationReturn {
  assets: AllocationPosition[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch portfolio allocation data with optional filtering
 * @param params - Optional parameters for filtering by asset types and tickers
 * @returns Assets array, loading state, error state, and refetch function
 */
export function usePortfolioAllocation(
  params?: UsePortfolioAllocationParams
): UsePortfolioAllocationReturn {
  const { isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<AllocationPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocation = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.debug('Fetching portfolio allocation', {
        context: 'usePortfolioAllocation',
        assetTypes: params?.asset_types,
        tickers: params?.tickers,
      });

      // Convert arrays to comma-separated strings for API
      const apiParams: PortfolioAllocationParams = {
        asset_types: params?.asset_types && params.asset_types.length > 0
          ? params.asset_types.join(',')
          : null,
        tickers: params?.tickers && params.tickers.length > 0
          ? params.tickers.join(',')
          : null,
      };

      const response = await getPortfolioAllocation(apiParams);

      setAssets(response.assets || []);

      logger.info('Portfolio allocation fetched successfully', {
        context: 'usePortfolioAllocation',
        assetCount: response.assets?.length || 0,
      });
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch portfolio allocation');
      setError(errorMessage);
      setAssets([]);
      logger.error('Failed to fetch portfolio allocation', {
        context: 'usePortfolioAllocation',
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, params?.asset_types?.join(','), params?.tickers?.join(',')]);

  useEffect(() => {
    fetchAllocation();
  }, [fetchAllocation]);

  const refetch = useCallback(async () => {
    await fetchAllocation();
  }, [fetchAllocation]);

  return {
    assets,
    loading,
    error,
    refetch,
  };
}
