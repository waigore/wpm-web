import { http, HttpResponse } from 'msw';
import usersData from './data/users.json';
import portfolioData from './data/portfolio.json';

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

    return HttpResponse.json({
      items: paginatedData,
      total,
      page,
      size,
      pages,
    });
  }),
];

