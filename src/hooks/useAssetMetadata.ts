import { useState, useEffect } from 'react';
import { getAllAssetMetadata } from '../api/services/portfolioService';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';
import logger from '../utils/logger';

export type AssetMetadata = Record<string, any> | null;

export interface UseAssetMetadataReturn {
  metadata: Record<string, AssetMetadata>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch asset metadata for given tickers
 * Non-blocking: Does not prevent page rendering if metadata fetch fails
 * @param tickers - Array of ticker symbols to fetch metadata for
 * @returns Metadata map, loading state, error state, and refetch function
 */
export function useAssetMetadata(tickers: string[]): UseAssetMetadataReturn {
  const { isAuthenticated } = useAuth();
  const [metadata, setMetadata] = useState<Record<string, AssetMetadata>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    if (!isAuthenticated || tickers.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.debug('Fetching asset metadata', {
        context: 'useAssetMetadata',
        tickerCount: tickers.length,
      });

      const response = await getAllAssetMetadata();

      // Extract metadata for the requested tickers
      const metadataMap: Record<string, AssetMetadata> = {};
      for (const ticker of tickers) {
        metadataMap[ticker] = response.metadata[ticker] ?? null;
      }

      setMetadata(metadataMap);

      logger.info('Asset metadata fetched successfully', {
        context: 'useAssetMetadata',
        tickerCount: tickers.length,
        metadataCount: Object.keys(metadataMap).length,
      });
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch asset metadata');
      setError(errorMessage);
      // Don't clear existing metadata on error - keep what we have
      logger.error('Failed to fetch asset metadata', {
        context: 'useAssetMetadata',
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have tickers and are authenticated
    if (isAuthenticated && tickers.length > 0) {
      fetchMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tickers.join(',')]); // Use tickers as dependency string to avoid unnecessary refetches

  const refetch = async () => {
    await fetchMetadata();
  };

  return {
    metadata,
    loading,
    error,
    refetch,
  };
}
