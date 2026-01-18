import { http, HttpResponse } from 'msw';
import usersData from './data/users.json';
import portfolioData from './data/portfolio.json';
import tradesData from './data/trades.json';
import lotsData from './data/lots.json';
import performanceData from './data/portfolio-performance.json';
import assetMetadataData from './data/asset-metadata.json';

// Mock JWT token generator (simple implementation for development)
function generateMockToken(username: string): string {
  // In a real app, this would be a proper JWT. For mock mode, we'll use a simple base64 encoded string
  return btoa(JSON.stringify({ username, exp: Date.now() + 3600000 }));
}

export const handlers = [
  // Login endpoint - MSW will match requests to any origin with this path
  http.post('*/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;

    // Find user in mock data
    const user = usersData.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const token = generateMockToken(username);
      return HttpResponse.json({
        access_token: token,
        token_type: 'bearer',
      });
    }

    // Invalid credentials
    return HttpResponse.json(
      { detail: 'Invalid username or password' },
      { status: 401 }
    );
  }),

  // Portfolio all endpoint - MSW will match requests to any origin with this path
  http.get('*/portfolio/all', async ({ request }) => {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const size = parseInt(url.searchParams.get('size') || '50', 10);
    const sortBy = url.searchParams.get('sort_by') || 'ticker';
    const sortOrder = url.searchParams.get('sort_order') || 'asc';

    // Validate sort_by field
    const validSortFields = [
      'ticker',
      'asset_type',
      'quantity',
      'average_price',
      'cost_basis',
      'current_price',
      'market_value',
      'unrealized_gain_loss',
      'allocation_percentage',
    ];
    if (!validSortFields.includes(sortBy)) {
      return HttpResponse.json(
        { detail: [{ loc: ['query', 'sort_by'], msg: 'Invalid sort field', type: 'value_error' }] },
        { status: 400 }
      );
    }

    // Sort data
    const sortedData = [...portfolioData].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const comparison = (aValue as number) - (bValue as number);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const total = sortedData.length;
    const pages = Math.ceil(total / size);

    // Calculate portfolio totals from all positions (not just paginated)
    const totalMarketValue = sortedData.reduce((sum, pos) => {
      return sum + (pos.market_value ?? 0);
    }, 0);
    
    const totalCostBasis = sortedData.reduce((sum, pos) => {
      return sum + (pos.cost_basis ?? 0);
    }, 0);
    
    const totalUnrealizedGainLoss = sortedData.reduce((sum, pos) => {
      return sum + (pos.unrealized_gain_loss ?? 0);
    }, 0);

    return HttpResponse.json({
      positions: {
        items: paginatedData,
        total,
        page,
        size,
        pages,
      },
      total_market_value: totalMarketValue > 0 ? totalMarketValue : null,
      total_cost_basis: totalCostBasis,
      total_unrealized_gain_loss: totalUnrealizedGainLoss !== 0 ? totalUnrealizedGainLoss : null,
    });
  }),

  // Asset trades endpoint - MSW will match requests to any origin with this path
  http.get('*/portfolio/trades/:ticker', async ({ request, params }) => {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { ticker } = params as { ticker: string };

    // Filter trades by ticker
    const filteredTrades = tradesData.filter((trade) => trade.ticker === ticker);

    // Return 404 if ticker not found
    if (filteredTrades.length === 0) {
      return HttpResponse.json(
        { detail: 'Asset not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);
    const sortBy = url.searchParams.get('sort_by') || 'date';
    const sortOrder = url.searchParams.get('sort_order') || 'asc';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    // Validate sort_by field
    const validSortFields = [
      'date',
      'ticker',
      'asset_type',
      'action',
      'order_instruction',
      'quantity',
      'price',
      'broker',
    ];
    if (!validSortFields.includes(sortBy)) {
      return HttpResponse.json(
        { detail: [{ loc: ['query', 'sort_by'], msg: 'Invalid sort field', type: 'value_error' }] },
        { status: 400 }
      );
    }

    // Apply date filtering if provided
    let dateFilteredTrades = filteredTrades;
    if (startDate || endDate) {
      dateFilteredTrades = filteredTrades.filter((trade) => {
        const tradeDate = trade.date;
        if (startDate && tradeDate < startDate) return false;
        if (endDate && tradeDate > endDate) return false;
        return true;
      });
    }

    // Sort data
    const sortedData = [...dateFilteredTrades].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Special handling for date field
      if (sortBy === 'date') {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        const comparison = aDate - bDate;
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const comparison = (aValue as number) - (bValue as number);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const total = sortedData.length;
    const pages = Math.ceil(total / size);

    return HttpResponse.json({
      trades: {
        items: paginatedData,
        total,
        page,
        size,
        pages,
      },
    });
  }),

  // Asset lots endpoint - MSW will match requests to any origin with this path
  http.get('*/portfolio/lots/:ticker', async ({ request, params }) => {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { ticker } = params as { ticker: string };

    // Filter lots by ticker
    const filteredLots = lotsData.filter((lot) => lot.ticker === ticker);

    // Return 404 if ticker not found
    if (filteredLots.length === 0) {
      return HttpResponse.json(
        { detail: 'Asset not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);
    const sortBy = url.searchParams.get('sort_by') || 'date';
    const sortOrder = url.searchParams.get('sort_order') || 'asc';
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const brokersParam = url.searchParams.get('brokers');
    const selectedBrokers = brokersParam ? brokersParam.split(',').map((b) => b.trim()) : null;

    // Validate sort_by field
    const validSortFields = [
      'date',
      'ticker',
      'asset_type',
      'broker',
      'original_quantity',
      'remaining_quantity',
      'cost_basis',
      'realized_pnl',
      'unrealized_pnl',
      'total_pnl',
    ];
    if (!validSortFields.includes(sortBy)) {
      return HttpResponse.json(
        { detail: [{ loc: ['query', 'sort_by'], msg: 'Invalid sort field', type: 'value_error' }] },
        { status: 400 }
      );
    }

    // Apply date filtering if provided
    let dateFilteredLots = filteredLots;
    if (startDate || endDate) {
      dateFilteredLots = filteredLots.filter((lot) => {
        const lotDate = lot.date;
        if (startDate && lotDate < startDate) return false;
        if (endDate && lotDate > endDate) return false;
        return true;
      });
    }

    // Apply broker filtering if provided
    let brokerFilteredLots = dateFilteredLots;
    if (selectedBrokers && selectedBrokers.length > 0) {
      brokerFilteredLots = dateFilteredLots.filter((lot) =>
        selectedBrokers.includes(lot.broker)
      );
    }

    // Sort data
    const sortedData = [...brokerFilteredLots].sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Special handling for date field
      if (sortBy === 'date') {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        const comparison = aDate - bDate;
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const comparison = (aValue as number) - (bValue as number);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const total = sortedData.length;
    const pages = Math.ceil(total / size);

    // Calculate position data from brokerFilteredLots (all lots, not just paginated)
    // Overall position: sum of all remaining quantities and cost bases
    const overallQuantity = brokerFilteredLots.reduce(
      (sum, lot) => sum + (lot.remaining_quantity || 0),
      0
    );
    const overallCostBasis = brokerFilteredLots.reduce(
      (sum, lot) => sum + (lot.cost_basis || 0),
      0
    );

    // Per-broker positions: group by broker and sum
    const brokerPositionsMap = new Map<string, { quantity: number; cost_basis: number }>();
    brokerFilteredLots.forEach((lot) => {
      const existing = brokerPositionsMap.get(lot.broker) || { quantity: 0, cost_basis: 0 };
      brokerPositionsMap.set(lot.broker, {
        quantity: existing.quantity + (lot.remaining_quantity || 0),
        cost_basis: existing.cost_basis + (lot.cost_basis || 0),
      });
    });

    const perBrokerPositions = Array.from(brokerPositionsMap.entries()).map(([broker, data]) => ({
      broker,
      quantity: data.quantity,
      cost_basis: data.cost_basis,
      market_value: null, // Mock data doesn't include current price, so set to null
    }));

    return HttpResponse.json({
      lots: {
        items: paginatedData,
        total,
        page,
        size,
        pages,
      },
      overall_position: {
        quantity: overallQuantity,
        cost_basis: overallCostBasis,
        market_value: null, // Mock data doesn't include current price, so set to null
      },
      per_broker_positions: perBrokerPositions,
    });
  }),

  // Asset brokers endpoint - MSW will match requests to any origin with this path
  http.get('*/asset/brokers/:ticker', async ({ request, params }) => {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { ticker } = params as { ticker: string };

    // Filter lots by ticker
    const filteredLots = lotsData.filter((lot) => lot.ticker === ticker);

    // Return 404 if ticker not found
    if (filteredLots.length === 0) {
      return HttpResponse.json(
        { detail: 'Asset not found' },
        { status: 404 }
      );
    }

    // Extract unique broker names
    const brokers = Array.from(new Set(filteredLots.map((lot) => lot.broker)));

    return HttpResponse.json({
      ticker,
      brokers,
    });
  }),

  // Portfolio performance endpoint - MSW will match requests to any origin with this path
  http.get('*/portfolio/all/performance', async ({ request }) => {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const granularity = url.searchParams.get('granularity') || 'daily';

    // Validate granularity
    const validGranularities = ['daily', 'weekly', 'monthly'];
    if (!validGranularities.includes(granularity)) {
      return HttpResponse.json(
        { detail: [{ loc: ['query', 'granularity'], msg: 'Invalid granularity', type: 'value_error' }] },
        { status: 422 }
      );
    }

    // Filter by date range
    let filteredData = [...performanceData];
    if (startDate || endDate) {
      filteredData = performanceData.filter((point) => {
        const pointDate = point.date;
        if (startDate && pointDate < startDate) return false;
        if (endDate && pointDate > endDate) return false;
        return true;
      });
    }

    // Apply granularity filtering
    let granularityFilteredData = filteredData;
    if (granularity === 'weekly') {
      // Filter to only Monday dates (or first day of week)
      granularityFilteredData = filteredData.filter((point) => {
        const date = new Date(point.date);
        return date.getDay() === 1; // Monday
      });
    } else if (granularity === 'monthly') {
      // Filter to only first day of month
      granularityFilteredData = filteredData.filter((point) => {
        const date = new Date(point.date);
        return date.getDate() === 1;
      });
    }
    // For 'daily', use all filtered data

    // Sort by date (ascending)
    granularityFilteredData.sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return aDate - bDate;
    });

    return HttpResponse.json({
      history_points: granularityFilteredData,
    });
  }),

  // Asset metadata all endpoint - MSW will match requests to any origin with this path
  http.get('*/asset/metadata/all', async ({ request }) => {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return mock metadata response
    return HttpResponse.json(assetMetadataData);
  }),
];

