import { DefaultService } from '../client/services/DefaultService';
import type { PortfolioAllResponse } from '../client';
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

