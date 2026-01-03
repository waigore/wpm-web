import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AssetTrades } from './AssetTrades';
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
  getAssetTrades: vi.fn(),
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

const mockTrades = [
  {
    date: '2024-01-15',
    ticker: 'AAPL',
    asset_type: 'Stock',
    action: 'Buy',
    order_instruction: 'limit',
    quantity: 50.0,
    price: 150.50,
    broker: 'Fidelity',
  },
  {
    date: '2024-02-10',
    ticker: 'AAPL',
    asset_type: 'Stock',
    action: 'Buy',
    order_instruction: 'market',
    quantity: 30.0,
    price: 160.0,
    broker: 'Charles Schwab',
  },
];

const renderAssetTrades = (ticker: string = 'AAPL') => {
  mockUseParams.mockReturnValue({ ticker });
  return render(
    <MemoryRouter initialEntries={[`/portfolio/asset/${ticker}`]}>
      <AuthProvider>
        <AssetTrades />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('AssetTrades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up auth mocks to return values synchronously
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
    // Reset useParams mock
    mockUseParams.mockReturnValue({ ticker: 'AAPL' });
  });

  it('renders asset trades page', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    renderAssetTrades();

    // Wait for AuthProvider to initialize and component to render
    await waitFor(() => {
      expect(screen.getByText(/AAPL: Trades/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders breadcrumbs with correct items including ticker', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    renderAssetTrades('AAPL');

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

  it('displays trades when data is loaded', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/AAPL: Trades/i)).toBeInTheDocument();
    });

    // Check for trade data in table (not in header)
    // Use getAllByText since there are multiple trades
    await waitFor(() => {
      const stockElements = screen.getAllByText('Stock');
      expect(stockElements.length).toBeGreaterThan(0);
      const buyElements = screen.getAllByText('Buy');
      expect(buyElements.length).toBeGreaterThan(0);
    });
  });

  it('displays loading state', () => {
    vi.mocked(portfolioService.getAssetTrades).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderAssetTrades();

    // Loading spinner should be visible
    expect(screen.getByLabelText(/loading trade data/i)).toBeInTheDocument();
  });

  it('displays error message on error', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getAssetTrades).mockRejectedValue(error);

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays empty state when no trades', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: [],
        total: 0,
        page: 1,
        size: 20,
        pages: 0,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/no trades found for this asset/i)).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 25,
        page: 1,
        size: 20,
        pages: 2,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/showing 1-20 of 25 trades/i)).toBeInTheDocument();
    });

    // Test pagination controls are present
    const pagination = screen.getByRole('navigation', { name: /pagination/i });
    expect(pagination).toBeInTheDocument();
  });

  it('handles page size change', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 25,
        page: 1,
        size: 20,
        pages: 2,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/showing 1-20 of 25 trades/i)).toBeInTheDocument();
    });

    // Verify pagination controls are present (page size selector and pagination)
    const pagination = screen.getByRole('navigation', { name: /pagination/i });
    expect(pagination).toBeInTheDocument();
    
    // Verify page size selector is present by checking for the label text
    // The InputLabel renders as text, so we check for it
    await waitFor(() => {
      const labels = screen.getAllByText(/page size/i);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('does not redirect when not authenticated (handled by ProtectedRoute)', () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUsername).mockReturnValue(null);

    renderAssetTrades();

    // Component no longer redirects - ProtectedRoute handles authentication
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays action column header', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/action/i)).toBeInTheDocument();
    });
  });

  it('displays action field in trade rows', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      // Should find multiple "Buy" texts (one in Action column, one in Order Instruction column)
      const buyElements = screen.getAllByText('Buy');
      expect(buyElements.length).toBeGreaterThan(0);
    });
  });

  it('displays broker column header', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/broker/i)).toBeInTheDocument();
    });
  });

  it('displays broker data in trade rows', async () => {
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText('Fidelity')).toBeInTheDocument();
      expect(screen.getByText('Charles Schwab')).toBeInTheDocument();
    });
  });

  it('allows sorting by action column', async () => {
    const user = userEvent.setup();
    vi.mocked(portfolioService.getAssetTrades).mockResolvedValue({
      trades: {
        items: mockTrades,
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      },
    });

    renderAssetTrades();

    await waitFor(() => {
      expect(screen.getByText(/action/i)).toBeInTheDocument();
    });

    const actionHeader = screen.getByText(/action/i);
    await user.click(actionHeader);

    await waitFor(() => {
      expect(portfolioService.getAssetTrades).toHaveBeenCalledWith(
        'AAPL',
        expect.objectContaining({
          sort_by: 'action',
        })
      );
    });
  });
});

