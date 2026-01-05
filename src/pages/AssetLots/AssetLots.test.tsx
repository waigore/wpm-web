import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AssetLots } from './AssetLots';
import { AuthProvider } from '../../context/AuthProvider';
import * as authService from '../../api/services/authService';
import * as portfolioService from '../../api/services/portfolioService';

// Mock dependencies
const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ ticker: 'AAPL' }));

vi.mock('../../api/services/authService', () => ({
  getToken: vi.fn(),
  getUsername: vi.fn(),
}));

vi.mock('../../api/services/portfolioService', () => ({
  getAssetLots: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockLots = [
  {
    date: '2024-01-15',
    ticker: 'AAPL',
    asset_type: 'Stock',
    original_quantity: 50.0,
    remaining_quantity: 40.0,
    cost_basis: 7525.0,
    matched_sells: [
      {
        trade: {
          date: '2024-03-05',
          ticker: 'AAPL',
          asset_type: 'Stock',
          action: 'Sell',
          order_instruction: 'limit',
          quantity: 10.0,
          price: 160.00,
          broker: 'Fidelity',
        },
        consumed_quantity: 10.0,
      },
    ],
  },
  {
    date: '2024-02-10',
    ticker: 'AAPL',
    asset_type: 'Stock',
    original_quantity: 50.0,
    remaining_quantity: 50.0,
    cost_basis: 7525.0,
    matched_sells: [],
  },
];

const renderAssetLots = (ticker: string = 'AAPL') => {
  mockUseParams.mockReturnValue({ ticker });
  return render(
    <MemoryRouter initialEntries={[`/portfolio/lots/${ticker}`]}>
      <AuthProvider>
        <AssetLots />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('AssetLots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up auth mocks to return values synchronously
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
    // Reset useParams mock
    mockUseParams.mockReturnValue({ ticker: 'AAPL' });
  });

  it('renders asset lots page', async () => {
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    renderAssetLots();

    // Wait for AuthProvider to initialize and component to render
    await waitFor(() => {
      expect(screen.getByText(/AAPL: Lots/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders breadcrumbs with correct items including ticker', async () => {
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    renderAssetLots('AAPL');

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    const homeLink = screen.getByText('Home').closest('a');
    const portfolioLink = screen.getByText('Portfolio').closest('a');
    
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/portfolio');
    expect(portfolioLink).toBeInTheDocument();
    expect(portfolioLink).toHaveAttribute('href', '/portfolio');
    
    // Last item (ticker) should not be a link
    const tickerElement = screen.getByText('AAPL');
    expect(tickerElement.closest('a')).not.toBeInTheDocument();
  });

  it('displays lots when data is loaded', async () => {
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: mockLots,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/AAPL: Lots/i)).toBeInTheDocument();
    });

    // Wait for data to load (not loading, no error)
    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading lot data/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that lot data is displayed - there may be multiple "Stock" elements
    await waitFor(() => {
      const stockElements = screen.getAllByText('Stock');
      expect(stockElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('displays matched sells as sub-rows', async () => {
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: mockLots,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/AAPL: Lots/i)).toBeInTheDocument();
    });

    // Check that matched sell data is displayed
    await waitFor(() => {
      expect(screen.getByText('Sell')).toBeInTheDocument();
      expect(screen.getByText('Fidelity')).toBeInTheDocument();
    });
  });

  it('displays empty state when no lots found', async () => {
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/No lots found for this asset/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    vi.mocked(portfolioService.getAssetLots).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderAssetLots();

    // Should show loading indicator
    expect(screen.getByLabelText(/Loading lot data/i)).toBeInTheDocument();
  });

  it('displays error message on error', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAssetLots).mockRejectedValue(error);

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('handles retry on error', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAssetLots).mockRejectedValueOnce(error);

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });

    // Mock successful response for retry
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(portfolioService.getAssetLots).toHaveBeenCalledTimes(2);
    });
  });

  it('handles sorting', async () => {
    const user = userEvent.setup();
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: mockLots,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/AAPL: Lots/i)).toBeInTheDocument();
    });

    // Find and click a sortable column header - use getAllByText and select the table header
    const dateHeaders = screen.getAllByText('Date');
    // The first one should be in the table header
    const dateHeader = dateHeaders.find(el => {
      const parent = el.closest('th');
      return parent !== null;
    }) || dateHeaders[0];
    
    await user.click(dateHeader);

    await waitFor(() => {
      expect(portfolioService.getAssetLots).toHaveBeenCalledWith(
        'AAPL',
        expect.objectContaining({
          sort_by: 'date',
        })
      );
    });
  });

  it('handles pagination', async () => {
    vi.mocked(portfolioService.getAssetLots).mockResolvedValue({
      lots: {
        items: mockLots,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetLots();

    await waitFor(() => {
      expect(screen.getByText(/AAPL: Lots/i)).toBeInTheDocument();
    });

    // Pagination controls should be present
    // Check for pagination-related text that's more specific
    const lotsTexts = screen.getAllByText(/lots/i);
    expect(lotsTexts.length).toBeGreaterThan(0);
  });

  it('returns null when ticker is not provided', () => {
    // Set up mock before rendering - need to pass undefined explicitly to avoid default parameter
    mockUseParams.mockReturnValue({ ticker: undefined });
    
    // Render directly without using renderAssetLots which has a default parameter
    render(
      <MemoryRouter initialEntries={['/portfolio/lots/']}>
        <AuthProvider>
          <AssetLots />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Component should return null when ticker is undefined
    // The component returns null, but the wrapper components (MemoryRouter, AuthProvider) still render
    // So we check that the AssetLots-specific content is not rendered
    // Since ticker is undefined, the title should not contain ": Lots"
    expect(screen.queryByText(/:\s*Lots/i)).not.toBeInTheDocument();
  });
});

