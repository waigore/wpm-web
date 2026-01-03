import { DefaultService } from '../client/services/DefaultService';
import type { PortfolioAllResponse, PortfolioAssetTradesResponse } from '../client';
import { getToken } from './authService';
import { OpenAPI } from '../client/core/OpenAPI';

// Configure OpenAPI base URL from environment
OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface PortfolioParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AssetTradesParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

/**
 * Get all portfolio positions with pagination and sorting
 * @param params - Optional parameters for pagination and sorting
 * @returns PortfolioAllResponse with paginated positions and portfolio totals
 */
export async function getAllPositions(
  params?: PortfolioParams
): Promise<PortfolioAllResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  const page = params?.page ?? 1;
  const size = params?.size ?? 50;
  const sortBy = params?.sort_by ?? 'ticker';
  const sortOrder = params?.sort_order ?? 'asc';

  return DefaultService.getAllPositionsEndpointPortfolioAllGet(
    page,
    size,
    sortBy,
    sortOrder
  );
}

/**
 * Get all trades for a specific asset with pagination, sorting, and optional date filtering
 * @param ticker - Asset ticker symbol
 * @param params - Optional parameters for pagination, sorting, and date filtering
 * @returns PortfolioAssetTradesResponse with paginated trades
 */
export async function getAssetTrades(
  ticker: string,
  params?: AssetTradesParams
): Promise<PortfolioAssetTradesResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  const page = params?.page ?? 1;
  const size = params?.size ?? 20;
  const sortBy = params?.sort_by ?? 'date';
  const sortOrder = params?.sort_order ?? 'asc';
  const startDate = params?.start_date ?? null;
  const endDate = params?.end_date ?? null;

  return DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet(
    ticker,
    page,
    size,
    startDate,
    endDate,
    sortBy,
    sortOrder
  );
}

