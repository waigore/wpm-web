import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllPositions, getAssetTrades, getAssetTradesAll, getAssetLots, getAllAssetMetadata, getAssetPriceHistory } from './portfolioService';
import { DefaultService } from '../client/services/DefaultService';
import { OpenAPI } from '../client/core/OpenAPI';
import * as authService from './authService';

// Mock the API client
vi.mock('../client/services/DefaultService', () => ({
  DefaultService: {
    getAllPositionsEndpointPortfolioAllGet: vi.fn(),
    getAssetTradesEndpointPortfolioTradesTickerGet: vi.fn(),
    getAssetTradesAllEndpointPortfolioTradesTickerAllGet: vi.fn(),
    getAssetLotsEndpointPortfolioLotsTickerGet: vi.fn(),
    getAllAssetMetadataEndpointAssetMetadataAllGet: vi.fn(),
    getAssetPriceHistoryEndpointAssetPricesTickerGet: vi.fn(),
  },
}));

// Mock authService
vi.mock('./authService', () => ({
  getToken: vi.fn(),
  logout: vi.fn(),
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
}));

describe('portfolioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    OpenAPI.BASE = 'http://localhost:8000';
  });

  describe('getAllPositions', () => {
    it('should fetch positions with default parameters', async () => {
      const mockResponse = {
        positions: {
          items: [],
          total: 0,
          page: 1,
          size: 50,
          pages: 0,
        },
        total_market_value: null,
        total_cost_basis: 0,
        total_unrealized_gain_loss: null,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllPositionsEndpointPortfolioAllGet).mockResolvedValue(mockResponse);

      const result = await getAllPositions();

      expect(result).toEqual(mockResponse);
      expect(result.positions).toBeDefined();
      expect(result.total_market_value).toBeNull();
      expect(result.total_cost_basis).toBe(0);
      expect(result.total_unrealized_gain_loss).toBeNull();
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
        positions: {
          items: [],
          total: 0,
          page: 2,
          size: 20,
          pages: 0,
        },
        total_market_value: 100000,
        total_cost_basis: 90000,
        total_unrealized_gain_loss: 10000,
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
      expect(result.positions).toBeDefined();
      expect(result.total_market_value).toBe(100000);
      expect(result.total_cost_basis).toBe(90000);
      expect(result.total_unrealized_gain_loss).toBe(10000);
      expect(DefaultService.getAllPositionsEndpointPortfolioAllGet).toHaveBeenCalledWith(
        2,
        20,
        'market_value',
        'desc'
      );
    });

    it('should use default values for undefined parameters', async () => {
      const mockResponse = {
        positions: {
          items: [],
          total: 0,
          page: 1,
          size: 50,
          pages: 0,
        },
        total_market_value: null,
        total_cost_basis: 0,
        total_unrealized_gain_loss: null,
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

    it('should return PortfolioAllResponse with totals', async () => {
      const mockResponse = {
        positions: {
          items: [],
          total: 5,
          page: 1,
          size: 50,
          pages: 1,
        },
        total_market_value: 231062.5,
        total_cost_basis: 205050,
        total_unrealized_gain_loss: 26012.5,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllPositionsEndpointPortfolioAllGet).mockResolvedValue(mockResponse);

      const result = await getAllPositions();

      expect(result).toHaveProperty('positions');
      expect(result).toHaveProperty('total_market_value');
      expect(result).toHaveProperty('total_cost_basis');
      expect(result).toHaveProperty('total_unrealized_gain_loss');
      expect(result.total_market_value).toBe(231062.5);
      expect(result.total_cost_basis).toBe(205050);
      expect(result.total_unrealized_gain_loss).toBe(26012.5);
    });
  });

  describe('getAssetTrades', () => {
    it('should fetch trades with default parameters', async () => {
      const mockResponse = {
        trades: {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          pages: 0,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet).mockResolvedValue(mockResponse);

      const result = await getAssetTrades('AAPL');

      expect(result).toEqual(mockResponse);
      expect(result.trades).toBeDefined();
      expect(DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet).toHaveBeenCalledWith(
        'AAPL',
        1,
        20,
        null,
        null,
        'date',
        'asc'
      );
      expect(authService.getToken).toHaveBeenCalled();
    });

    it('should fetch trades with custom parameters', async () => {
      const mockResponse = {
        trades: {
          items: [],
          total: 0,
          page: 2,
          size: 50,
          pages: 0,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet).mockResolvedValue(mockResponse);

      const result = await getAssetTrades('GOOGL', {
        page: 2,
        size: 50,
        sort_by: 'price',
        sort_order: 'desc',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet).toHaveBeenCalledWith(
        'GOOGL',
        2,
        50,
        '2024-01-01',
        '2024-12-31',
        'price',
        'desc'
      );
    });

    it('should use default values for undefined parameters', async () => {
      const mockResponse = {
        trades: {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          pages: 0,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet).mockResolvedValue(mockResponse);

      await getAssetTrades('MSFT', {
        page: undefined,
        size: undefined,
      });

      expect(DefaultService.getAssetTradesEndpointPortfolioTradesTickerGet).toHaveBeenCalledWith(
        'MSFT',
        1,
        20,
        null,
        null,
        'date',
        'asc'
      );
    });
  });

  describe('getAssetTradesAll', () => {
    it('should fetch all trades with default parameters', async () => {
      const mockResponse = {
        trades: [],
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).mockResolvedValue(mockResponse);

      const result = await getAssetTradesAll('AAPL');

      expect(result).toEqual(mockResponse);
      expect(result.trades).toBeDefined();
      expect(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).toHaveBeenCalledWith(
        'AAPL',
        null,
        null,
        'date',
        'asc'
      );
      expect(authService.getToken).toHaveBeenCalled();
    });

    it('should fetch all trades with custom parameters', async () => {
      const mockResponse = {
        trades: [
          {
            date: '2024-01-15',
            ticker: 'GOOGL',
            asset_type: 'Stock',
            action: 'Buy',
            order_instruction: 'limit',
            quantity: 25.0,
            price: 2500.0,
            broker: 'TD Ameritrade',
          },
        ],
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).mockResolvedValue(mockResponse);

      const result = await getAssetTradesAll('GOOGL', {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        sort_by: 'price',
        sort_order: 'desc',
      });

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).toHaveBeenCalledWith(
        'GOOGL',
        '2024-01-01',
        '2024-12-31',
        'price',
        'desc'
      );
    });

    it('should use default values for undefined parameters', async () => {
      const mockResponse = {
        trades: [],
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).mockResolvedValue(mockResponse);

      await getAssetTradesAll('MSFT', {
        start_date: undefined,
        end_date: undefined,
        sort_by: undefined,
        sort_order: undefined,
      });

      expect(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).toHaveBeenCalledWith(
        'MSFT',
        null,
        null,
        'date',
        'asc'
      );
    });

    it('should handle 401 error', async () => {
      const error: any = new Error('Unauthorized');
      error.status = 401;

      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(() => 'mock-token'),
        removeItem: vi.fn(),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).mockRejectedValue(error);

      await expect(getAssetTradesAll('AAPL')).rejects.toThrow('Unauthorized');
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('should handle 404 error', async () => {
      const error: any = new Error('Not found');
      error.status = 404;

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).mockRejectedValue(error);

      await expect(getAssetTradesAll('INVALID')).rejects.toThrow('Not found');
    });

    it('should handle 500 error', async () => {
      const error: any = new Error('Server error');
      error.status = 500;

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetTradesAllEndpointPortfolioTradesTickerAllGet).mockRejectedValue(error);

      await expect(getAssetTradesAll('AAPL')).rejects.toThrow('Server error');
    });
  });

  describe('getAssetLots', () => {
    it('should fetch lots with default parameters', async () => {
      const mockResponse = {
        lots: {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          pages: 0,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet).mockResolvedValue(mockResponse);

      const result = await getAssetLots('AAPL');

      expect(result).toEqual(mockResponse);
      expect(result.lots).toBeDefined();
      expect(DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet).toHaveBeenCalledWith(
        'AAPL',
        1,
        20,
        null,
        null,
        null,
        'date',
        'asc'
      );
      expect(authService.getToken).toHaveBeenCalled();
    });

    it('should fetch lots with custom parameters', async () => {
      const mockResponse = {
        lots: {
          items: [],
          total: 0,
          page: 2,
          size: 50,
          pages: 0,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet).mockResolvedValue(mockResponse);

      const result = await getAssetLots('GOOGL', {
        page: 2,
        size: 50,
        sort_by: 'cost_basis',
        sort_order: 'desc',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet).toHaveBeenCalledWith(
        'GOOGL',
        2,
        50,
        '2024-01-01',
        '2024-12-31',
        null,
        'cost_basis',
        'desc'
      );
    });

    it('should use default values for undefined parameters', async () => {
      const mockResponse = {
        lots: {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          pages: 0,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet).mockResolvedValue(mockResponse);

      await getAssetLots('MSFT', {
        page: undefined,
        size: undefined,
      });

      expect(DefaultService.getAssetLotsEndpointPortfolioLotsTickerGet).toHaveBeenCalledWith(
        'MSFT',
        1,
        20,
        null,
        null,
        null,
        'date',
        'asc'
      );
    });
  });

  describe('getAllAssetMetadata', () => {
    it('should fetch metadata successfully', async () => {
      const mockResponse = {
        metadata: {
          AAPL: {
            name: 'Apple Inc.',
            type: 'Stock',
            market_cap: '$3.02T',
            sector: 'Technology',
            industry: 'Consumer Electronics',
            country: 'United States',
            category: 'Large Cap',
          },
          GOOGL: {
            name: 'Alphabet Inc.',
            type: 'Stock',
            market_cap: '$1.75T',
            sector: 'Communication Services',
            industry: 'Internet Content & Information',
            country: 'United States',
            category: 'Large Cap',
          },
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllAssetMetadataEndpointAssetMetadataAllGet).mockResolvedValue(mockResponse);

      const result = await getAllAssetMetadata();

      expect(result).toEqual(mockResponse);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.AAPL).toBeDefined();
      expect(result.metadata.AAPL?.name).toBe('Apple Inc.');
      expect(DefaultService.getAllAssetMetadataEndpointAssetMetadataAllGet).toHaveBeenCalled();
      expect(authService.getToken).toHaveBeenCalled();
    });

    it('should handle metadata with null values', async () => {
      const mockResponse = {
        metadata: {
          AAPL: {
            name: 'Apple Inc.',
            type: 'Stock',
            market_cap: '$3.02T',
            sector: 'Technology',
            industry: 'Consumer Electronics',
            country: 'United States',
            category: 'Large Cap',
          },
          INVALID: null,
        },
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllAssetMetadataEndpointAssetMetadataAllGet).mockResolvedValue(mockResponse);

      const result = await getAllAssetMetadata();

      expect(result).toEqual(mockResponse);
      expect(result.metadata.INVALID).toBeNull();
      expect(result.metadata.AAPL).not.toBeNull();
    });

    it('should handle empty metadata response', async () => {
      const mockResponse = {
        metadata: {},
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllAssetMetadataEndpointAssetMetadataAllGet).mockResolvedValue(mockResponse);

      const result = await getAllAssetMetadata();

      expect(result).toEqual(mockResponse);
      expect(Object.keys(result.metadata)).toHaveLength(0);
    });

    it('should call getToken to set authentication', async () => {
      const mockResponse = {
        metadata: {},
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAllAssetMetadataEndpointAssetMetadataAllGet).mockResolvedValue(mockResponse);

      await getAllAssetMetadata();

      expect(authService.getToken).toHaveBeenCalled();
    });
  });

  describe('getAssetPriceHistory', () => {
    it('should fetch price history with default parameters', async () => {
      const mockResponse = {
        ticker: 'AAPL',
        asset_type: 'Stock',
        prices: [
          { date: '2025-01-02', price: 170.25 },
          { date: '2025-01-03', price: 171.1 },
        ],
        current_price: 171.1,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetPriceHistoryEndpointAssetPricesTickerGet).mockResolvedValue(
        mockResponse as any
      );

      const result = await getAssetPriceHistory('AAPL');

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAssetPriceHistoryEndpointAssetPricesTickerGet).toHaveBeenCalledWith(
        'AAPL',
        null,
        null
      );
      expect(authService.getToken).toHaveBeenCalled();
    });

    it('should fetch price history with custom date range', async () => {
      const mockResponse = {
        ticker: 'AAPL',
        asset_type: 'Stock',
        prices: [],
        current_price: null,
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(DefaultService.getAssetPriceHistoryEndpointAssetPricesTickerGet).mockResolvedValue(
        mockResponse as any
      );

      const result = await getAssetPriceHistory('AAPL', {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      });

      expect(result).toEqual(mockResponse);
      expect(DefaultService.getAssetPriceHistoryEndpointAssetPricesTickerGet).toHaveBeenCalledWith(
        'AAPL',
        '2025-01-01',
        '2025-01-31'
      );
    });
  });
});

