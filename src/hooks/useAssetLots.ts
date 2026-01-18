import { useState, useEffect } from 'react';
import { getAssetLots, AssetLotsParams } from '../api/services/portfolioService';
import type { Lot, OverallPosition, BrokerPosition } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UseAssetLotsReturn {
  lots: Lot[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  overallPosition: OverallPosition | null;
  perBrokerPositions: BrokerPosition[];
  refetch: () => Promise<void>;
}

export function useAssetLots(
  ticker: string,
  params?: AssetLotsParams
): UseAssetLotsReturn {
  const { isAuthenticated } = useAuth();
  const [lots, setLots] = useState<Lot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page ?? 1);
  const [pageSize, setPageSize] = useState(params?.size ?? 20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overallPosition, setOverallPosition] = useState<OverallPosition | null>(null);
  const [perBrokerPositions, setPerBrokerPositions] = useState<BrokerPosition[]>([]);

  const fetchLots = async () => {
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
      const response = await getAssetLots(ticker, apiParams);

      setLots(response.lots.items || []);
      setTotalItems(response.lots.total || 0);
      setTotalPages(response.lots.pages || 0);
      setCurrentPage(response.lots.page || 1);
      setPageSize(response.lots.size || pageSize);
      setOverallPosition(response.overall_position || null);
      setPerBrokerPositions(response.per_broker_positions || []);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch asset lots');
      setError(errorMessage);
      setLots([]);
      setOverallPosition(null);
      setPerBrokerPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, ticker, currentPage, pageSize, params?.page, params?.size, params?.sort_by, params?.sort_order, params?.start_date, params?.end_date, params?.brokers]);

  const refetch = async () => {
    await fetchLots();
  };

  return {
    lots,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    overallPosition,
    perBrokerPositions,
    refetch,
  };
}






