import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioAllocation } from './PortfolioAllocation';
import { AuthProvider } from '../../context/AuthProvider';
import * as authService from '../../api/services/authService';
import * as portfolioService from '../../api/services/portfolioService';

// Mock dependencies
const mockNavigate = vi.fn();

vi.mock('../../api/services/authService', () => ({
  getToken: vi.fn(),
  getUsername: vi.fn(),
}));

vi.mock('../../api/services/portfolioService', () => ({
  getPortfolioAllocation: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

const mockAssets = [
  {
    ticker: 'AAPL',
    asset_type: 'Stock',
    quantity: 100,
    average_price: 150.0,
    cost_basis: 15000.0,
    cost_basis_method: 'fifo',
    current_price: 175.0,
    market_value: 17500.0,
    unrealized_gain_loss: 2500.0,
    allocation_percentage: 50.0,
    realized_gain_loss: null,
    metadata: {
      sector: 'Technology',
      industry: 'Consumer Electronics',
    },
  },
  {
    ticker: 'MSFT',
    asset_type: 'Stock',
    quantity: 50,
    average_price: 300.0,
    cost_basis: 15000.0,
    cost_basis_method: 'fifo',
    current_price: 350.0,
    market_value: 17500.0,
    unrealized_gain_loss: 2500.0,
    allocation_percentage: 50.0,
    realized_gain_loss: null,
    metadata: {
      sector: 'Technology',
      industry: 'Software',
    },
  },
];

const renderPortfolioAllocation = () => {
  return render(
    <MemoryRouter initialEntries={['/portfolio/allocation']}>
      <AuthProvider>
        <PortfolioAllocation />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('PortfolioAllocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('renders portfolio allocation page', async () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { name: /Portfolio Allocation/i });
      expect(headings.length).toBeGreaterThan(0);
    });

    const headings = screen.getAllByRole('heading', { name: /Portfolio Allocation/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('displays loading state', () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderPortfolioAllocation();

    expect(screen.getByLabelText(/Loading allocation data/i)).toBeInTheDocument();
  });

  it('displays error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getPortfolioAllocation).mockRejectedValue(error);

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no assets match filters', async () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: [],
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(
        screen.getByText(/No assets match the selected filters/i)
      ).toBeInTheDocument();
    });
  });

  it('renders filters', async () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(screen.getByText('Asset Types')).toBeInTheDocument();
      expect(screen.getByText('Tickers')).toBeInTheDocument();
    });
  });

  it('renders chart when assets are available', async () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    const { container } = renderPortfolioAllocation();

    await waitFor(() => {
      const chartTitle = screen.getAllByText('Portfolio Allocation');
      expect(chartTitle.length).toBeGreaterThan(0);
    });

    // Check that chart container is rendered
    const chartContainer = container.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('updates chart when asset type filter changes', async () => {
    const user = userEvent.setup();
    
    // Initial load with all assets
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    renderPortfolioAllocation();

    // Wait for initial data to load and filters to be populated
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Portfolio Allocation/i })).toBeInTheDocument();
    });

    // Wait for assets to load so filters have options
    await waitFor(() => {
      const assetTypeInput = screen.getByLabelText('Filter by asset types');
      expect(assetTypeInput).toBeInTheDocument();
    });

    // Now mock the filtered response
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValueOnce({
      assets: mockAssets.filter((a) => a.asset_type === 'Stock'),
    });

    const assetTypeInput = screen.getByLabelText('Filter by asset types');
    await user.click(assetTypeInput);
    await user.type(assetTypeInput, 'Stock');

    // Wait for Autocomplete options to appear (they're in a portal)
    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'Stock' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const stockOption = screen.getByRole('option', { name: 'Stock' });
    await user.click(stockOption);

    // Wait for API call with filter - need to check that it was called with the filter
    await waitFor(
      () => {
        const calls = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls;
        // Find a call with Stock filter (should be one of the later calls)
        const filteredCall = calls.find(
          (call) => call[0]?.asset_types === 'Stock'
        );
        expect(filteredCall).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('updates chart when ticker filter changes', async () => {
    const user = userEvent.setup();
    
    // Initial load with all assets
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    renderPortfolioAllocation();

    // Wait for initial data to load and filters to be populated
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Portfolio Allocation/i })).toBeInTheDocument();
    });

    // Wait for assets to load so filters have options
    await waitFor(() => {
      const tickerInput = screen.getByLabelText('Filter by ticker symbols');
      expect(tickerInput).toBeInTheDocument();
    });

    // Now mock the filtered response
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValueOnce({
      assets: mockAssets.filter((a) => a.ticker === 'AAPL'),
    });

    const tickerInput = screen.getByLabelText('Filter by ticker symbols');
    await user.click(tickerInput);
    await user.type(tickerInput, 'AAPL');

    // Wait for Autocomplete options to appear (they're in a portal)
    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'AAPL' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const aaplOption = screen.getByRole('option', { name: 'AAPL' });
    await user.click(aaplOption);

    // Wait for API call with filter - need to check that it was called with the filter
    await waitFor(
      () => {
        const calls = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls;
        // Find a call with AAPL filter (should be one of the later calls)
        const filteredCall = calls.find(
          (call) => call[0]?.tickers === 'AAPL'
        );
        expect(filteredCall).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  it('handles empty filter state (shows all assets)', async () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Portfolio Allocation/i })).toBeInTheDocument();
    });

    // Should call API with null filters (show all)
    expect(portfolioService.getPortfolioAllocation).toHaveBeenCalledWith({
      asset_types: null,
      tickers: null,
    });
  });

  it('handles error recovery with retry', async () => {
    const error = new Error('Network error');
    // Mock both calls - first for all assets (options), second for filtered data
    // If the filtered call fails, we should see an error
    vi.mocked(portfolioService.getPortfolioAllocation)
      .mockResolvedValueOnce({
        assets: mockAssets,
      })
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        assets: mockAssets,
      });

    const user = userEvent.setup();
    renderPortfolioAllocation();

    // Wait for error message to appear (could be "Failed to fetch portfolio allocation" or similar)
    await waitFor(() => {
      const errorText = screen.queryByText(/Failed to fetch/i) || 
                       screen.queryByText(/Network error/i) ||
                       screen.queryByText(/error/i);
      expect(errorText).toBeInTheDocument();
    }, { timeout: 5000 });

    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { name: /Portfolio Allocation/i });
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it('fetches all options on initial load for static filter lists', async () => {
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: mockAssets,
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Portfolio Allocation/i })).toBeInTheDocument();
    });

    // Should make at least one call with no filters to get all options
    const calls = vi.mocked(portfolioService.getPortfolioAllocation).mock.calls;
    const unfilteredCall = calls.find(
      (call) => call[0]?.asset_types === null && call[0]?.tickers === null
    );
    expect(unfilteredCall).toBeDefined();
  });

  it('keeps all ticker options available after selecting one ticker', async () => {
    const user = userEvent.setup();
    
    // Mock initial unfiltered response with multiple tickers
    const allAssets = [
      ...mockAssets,
      {
        ticker: 'GOOGL',
        asset_type: 'Stock',
        quantity: 25,
        average_price: 200.0,
        cost_basis: 5000.0,
        cost_basis_method: 'fifo',
        current_price: 250.0,
        market_value: 6250.0,
        unrealized_gain_loss: 1250.0,
        allocation_percentage: 20.0,
        realized_gain_loss: null,
        metadata: null,
      },
    ];

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: allAssets,
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Portfolio Allocation/i })).toBeInTheDocument();
    });

    // Select AAPL ticker
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValueOnce({
      assets: allAssets.filter((a) => a.ticker === 'AAPL'),
    });

    const tickerInput = screen.getByLabelText('Filter by ticker symbols');
    await user.click(tickerInput);
    await user.type(tickerInput, 'AAPL');

    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'AAPL' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const aaplOption = screen.getByRole('option', { name: 'AAPL' });
    await user.click(aaplOption);

    // After selecting AAPL, all options should still be available
    // Click the input again to verify options are still there
    await user.click(tickerInput);
    await user.type(tickerInput, 'GOOGL');

    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'GOOGL' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('allows mixed selections (asset type from one category, ticker from another)', async () => {
    const user = userEvent.setup();
    
    const allAssets = [
      ...mockAssets,
      {
        ticker: 'VOO',
        asset_type: 'ETF',
        quantity: 50,
        average_price: 400.0,
        cost_basis: 20000.0,
        cost_basis_method: 'fifo',
        current_price: 420.0,
        market_value: 21000.0,
        unrealized_gain_loss: 1000.0,
        allocation_percentage: 30.0,
        realized_gain_loss: null,
        metadata: null,
      },
    ];

    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValue({
      assets: allAssets,
    });

    renderPortfolioAllocation();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Portfolio Allocation/i })).toBeInTheDocument();
    });

    // Select Crypto asset type
    vi.mocked(portfolioService.getPortfolioAllocation).mockResolvedValueOnce({
      assets: [],
    });

    const assetTypeInput = screen.getByLabelText('Filter by asset types');
    await user.click(assetTypeInput);
    await user.type(assetTypeInput, 'Crypto');

    // Even though we selected Crypto, we should still be able to select VOO (ETF ticker)
    const tickerInput = screen.getByLabelText('Filter by ticker symbols');
    await user.click(tickerInput);
    await user.type(tickerInput, 'VOO');

    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'VOO' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
