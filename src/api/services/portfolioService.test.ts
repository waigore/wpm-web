import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllPositions } from './portfolioService';
import { DefaultService } from '../client/services/DefaultService';
import { OpenAPI } from '../client/core/OpenAPI';
import * as authService from './authService';

// Mock the API client
vi.mock('../client/services/DefaultService', () => ({
  DefaultService: {
    getAllPositionsEndpointPortfolioAllGet: vi.fn(),
  },
}));

// Mock authService
vi.mock('./authService', () => ({
  getToken: vi.fn(),
}));

describe('portfolioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    OpenAPI.BASE = 'http://localhost:8000';
  });

  describe('getAllPositions', () => {
    it('should fetch positions with default parameters', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        size: 50,
        pages: 0,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllPositionsEndpointPortfolioAllGet).mockResolvedValue(mockResponse);

      const result = await getAllPositions();

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAllPositionsEndpointPortfolioAllGet).toHaveBeenCalledWith(
        1,
        50,
        'ticker',
        'asc'
      );
      expect(authService.getToken).toHaveBeenCalled();
    });

    it('should fetch positions with custom parameters', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 2,
        size: 20,
        pages: 0,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllPositionsEndpointPortfolioAllGet).mockResolvedValue(mockResponse);

      const result = await getAllPositions({
        page: 2,
        size: 20,
        sort_by: 'market_value',
        sort_order: 'desc',
      });

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAllPositionsEndpointPortfolioAllGet).toHaveBeenCalledWith(
        2,
        20,
        'market_value',
        'desc'
      );
    });

    it('should use default values for undefined parameters', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        size: 50,
        pages: 0,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllPositionsEndpointPortfolioAllGet).mockResolvedValue(mockResponse);

      await getAllPositions({
        page: undefined,
        size: undefined,
      });

      expect(DefaultService.getAllPositionsEndpointPortfolioAllGet).toHaveBeenCalledWith(
        1,
        50,
        'ticker',
        'asc'
      );
    });
  });
});

