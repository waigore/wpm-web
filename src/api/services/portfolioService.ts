import { DefaultService } from '../client/services/DefaultService';
import type { PortfolioAllResponse, PortfolioAssetTradesResponse, PortfolioAssetTradesAllResponse, PortfolioAssetLotsResponse, PortfolioPerformanceResponse, AssetMetadataAllResponse, AssetBrokersResponse, AssetPriceHistoryResponse } from '../client';
import { getToken } from './authService';
import { OpenAPI } from '../client/core/OpenAPI';
import { handle401Error } from './errorHandler';

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

export interface AssetTradesAllParams {
  start_date?: string | null;
  end_date?: string | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AssetLotsParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
  brokers?: string;
}

export interface PortfolioPerformanceParams {
  start_date?: string | null;
  end_date?: string | null;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface AssetPriceHistoryParams {
  start_date?: string | null;
  end_date?: string | null;
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

  try {
    return await DefaultService.getAllPositionsEndpointPortfolioAllGet(
      page,
      size,
      sortBy,
      sortOrder
    );
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
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

  try {
    return await DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet(
      ticker,
      page,
      size,
      startDate,
      endDate,
      sortBy,
      sortOrder
    );
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}

/**
 * Get all trades for a specific asset without pagination, with optional date filtering and sorting
 * @param ticker - Asset ticker symbol
 * @param params - Optional parameters for date filtering and sorting
 * @returns PortfolioAssetTradesAllResponse with all trades (no pagination)
 */
export async function getAssetTradesAll(
  ticker: string,
  params?: AssetTradesAllParams
): Promise<PortfolioAssetTradesAllResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  const startDate = params?.start_date ?? null;
  const endDate = params?.end_date ?? null;
  const sortBy = params?.sort_by ?? 'date';
  const sortOrder = params?.sort_order ?? 'asc';

  try {
    return await DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet(
      ticker,
      startDate,
      endDate,
      sortBy,
      sortOrder
    );
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}

/**
 * Get all lots for a specific asset with pagination, sorting, and optional date filtering
 * @param ticker - Asset ticker symbol
 * @param params - Optional parameters for pagination, sorting, date filtering, and broker filtering
 * @returns PortfolioAssetLotsResponse with paginated lots
 */
export async function getAssetLots(
  ticker: string,
  params?: AssetLotsParams
): Promise<PortfolioAssetLotsResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  const page = params?.page ?? 1;
  const size = params?.size ?? 20;
  const sortBy = params?.sort_by ?? 'date';
  const sortOrder = params?.sort_order ?? 'asc';
  const startDate = params?.start_date ?? null;
  const endDate = params?.end_date ?? null;
  const brokers = params?.brokers ?? null;

  try {
    return await DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet(
      ticker,
      page,
      size,
      startDate,
      endDate,
      brokers,
      sortBy,
      sortOrder
    );
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}

/**
 * Get portfolio performance data with optional date filtering and granularity
 * @param params - Optional parameters for date range and granularity
 * @returns PortfolioPerformanceResponse with history points
 */
export async function getPortfolioPerformance(
  params?: PortfolioPerformanceParams
): Promise<PortfolioPerformanceResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  const startDate = params?.start_date ?? null;
  const endDate = params?.end_date ?? null;
  const granularity = params?.granularity ?? 'daily';

  try {
    return await DefaultService.getPortfolioPerformanceEndpointPortfolioAllPerformanceGet(
      startDate,
      endDate,
      granularity
    );
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}

/**
 * Get historical price data for a specific asset
 * @param ticker - Asset ticker symbol
 * @param params - Optional parameters for date range
 * @returns AssetPriceHistoryResponse with historical prices and current price
 */
export async function getAssetPriceHistory(
  ticker: string,
  params?: AssetPriceHistoryParams
): Promise<AssetPriceHistoryResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  const startDate = params?.start_date ?? null;
  const endDate = params?.end_date ?? null;

  try {
    return await DefaultService.getAssetPriceHistoryEndpointAssetPricesTickerGet(
      ticker,
      startDate,
      endDate
    );
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}

/**
 * Get metadata for all assets in the portfolio
 * @returns AssetMetadataAllResponse containing metadata dictionary mapping ticker to metadata
 */
export async function getAllAssetMetadata(): Promise<AssetMetadataAllResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  try {
    return await DefaultService.getAllAssetMetadataEndpointAssetMetadataAllGet();
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}

/**
 * Get list of brokers for a specific asset
 * @param ticker - Asset ticker symbol
 * @returns AssetBrokersResponse containing ticker and list of broker names
 */
export async function getAssetBrokers(ticker: string): Promise<AssetBrokersResponse> {
  // Ensure token is set in OpenAPI config (getToken already does this)
  getToken();

  try {
    return await DefaultService.getAssetBrokersEndpointAssetBrokersTickerGet(ticker);
  } catch (error: unknown) {
    handle401Error(error);
    throw error;
  }
}
