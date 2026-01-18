import { useState, useEffect, useCallback } from 'react';
import { getAllPositions, PortfolioParams } from '../api/services/portfolioService';
import type { Position } from '../api/client';
import { useAuth } from './useAuth';
import { extractErrorMessage } from '../utils/errorHelpers';

export interface UsePortfolioReturn {
  positions: Position[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  totalMarketValue: number | null;
  totalUnrealizedGainLoss: number | null;
  totalRealizedGainLoss: number | null;
  totalCostBasis: number;
  refetch: () => Promise<void>;
}

export function usePortfolio(params?: PortfolioParams): UsePortfolioReturn {
  const { isAuthenticated } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page ?? 1);
  const [pageSize, setPageSize] = useState(params?.size ?? 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalMarketValue, setTotalMarketValue] = useState<number | null>(null);
  const [totalUnrealizedGainLoss, setTotalUnrealizedGainLoss] = useState<number | null>(null);
  const [totalRealizedGainLoss, setTotalRealizedGainLoss] = useState<number | null>(null);
  const [totalCostBasis, setTotalCostBasis] = useState(0);

  const fetchPositions = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAllPositions({
        ...params,
        page: params?.page ?? currentPage,
        size: params?.size ?? pageSize,
      });

      setPositions(response.positions.items || []);
      setTotalItems(response.positions.total || 0);
      setTotalPages(response.positions.pages || 0);
      setCurrentPage(response.positions.page || 1);
      setPageSize(response.positions.size || pageSize);
      setTotalMarketValue(response.total_market_value ?? null);
      setTotalUnrealizedGainLoss(response.total_unrealized_gain_loss ?? null);
      setTotalRealizedGainLoss(response.total_realized_gain_loss ?? null);
      setTotalCostBasis(response.total_cost_basis || 0);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Failed to fetch portfolio positions');
      setError(errorMessage);
      setPositions([]);
      setTotalMarketValue(null);
      setTotalUnrealizedGainLoss(null);
      setTotalRealizedGainLoss(null);
      setTotalCostBasis(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentPage, pageSize, params?.page, params?.size, params?.sort_by, params?.sort_order]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const refetch = useCallback(async () => {
    await fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    totalMarketValue,
    totalUnrealizedGainLoss,
    totalRealizedGainLoss,
    totalCostBasis,
    refetch,
  };
}

