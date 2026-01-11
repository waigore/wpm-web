import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioPerformance } from './PortfolioPerformance';
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
  getPortfolioPerformance: vi.fn(),
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

const mockHistoryPoints = [
  {
    date: '2024-01-01',
    total_market_value: 100000.0,
    asset_positions: { AAPL: 5000.0 },
    prices: { AAPL: 150.0 },
  },
  {
    date: '2024-01-15',
    total_market_value: 105000.0,
    asset_positions: { AAPL: 5500.0 },
    prices: { AAPL: 155.0 },
  },
  {
    date: '2024-02-01',
    total_market_value: 110000.0,
    asset_positions: { AAPL: 6000.0 },
    prices: { AAPL: 160.0 },
  },
];

const renderPortfolioPerformance = () => {
  return render(
    <MemoryRouter initialEntries={['/portfolio/performance']}>
      <AuthProvider>
        <PortfolioPerformance />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('PortfolioPerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    vi.mocked(authService.getUsername).mockReturnValue('testuser');
  });

  it('renders portfolio performance page', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderPortfolioPerformance();

    expect(screen.getByLabelText(/Loading performance data/i)).toBeInTheDocument();
  });

  it('displays error state', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getPortfolioPerformance).mockRejectedValue(error);

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no data', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: [],
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(
        screen.getByText(/No performance data available for the selected date range/i)
      ).toBeInTheDocument();
    });
  });

  it('renders chart with data', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      // Check if chart container is rendered (recharts creates responsive container)
      const chartContainer = document.querySelector('.recharts-responsive-container');
      expect(chartContainer).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles granularity toggle change', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
    });

    // Wait for initial call
    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalled();
    });

    const weeklyButton = screen.getByRole('button', { name: /weekly/i });
    await userEvent.click(weeklyButton);

    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledTimes(2);
    });

    // Check that the second call includes weekly granularity
    const lastCall = vi.mocked(portfolioService.getPortfolioPerformance).mock.calls[
      vi.mocked(portfolioService.getPortfolioPerformance).mock.calls.length - 1
    ][0];
    expect(lastCall?.granularity).toBe('weekly');
  });

  it('handles date range toggle change', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
    });

    // Wait for initial call
    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalled();
    });

    const portfolioStartButton = screen.getByRole('button', { name: /portfolio start/i });
    await userEvent.click(portfolioStartButton);

    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledTimes(2);
    });
  });

  it('handles retry on error', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(portfolioService.getPortfolioPerformance)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        history_points: mockHistoryPoints,
      });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledTimes(2);
    });
  });

  it('calculates date range correctly for YTD', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalled();
    });

    const callArgs = vi.mocked(portfolioService.getPortfolioPerformance).mock.calls[0][0];
    // YTD should have a start_date of January 1st of current year
    expect(callArgs).toBeDefined();
    if (callArgs?.start_date) {
      const currentYear = new Date().getFullYear();
      // Account for timezone differences - the date should be January 1st of current year
      // or December 31st of previous year (depending on timezone)
      const startDate = new Date(callArgs.start_date);
      const expectedDate = new Date(currentYear, 0, 1); // January 1st of current year
      const daysDiff = Math.floor((expectedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      // Allow for timezone differences (should be 0 or 1 day off)
      expect(Math.abs(daysDiff)).toBeLessThanOrEqual(1);
      // Also check that the year matches (allowing for year boundary due to timezone)
      const yearMatch = startDate.getFullYear() === currentYear || startDate.getFullYear() === currentYear - 1;
      expect(yearMatch).toBe(true);
    } else {
      // If start_date is null, that's also valid (API will use default)
      expect(callArgs?.start_date).toBeNull();
    }
  });

  it('calculates date range correctly for 52w', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
    });

    const week52Button = screen.getByRole('button', { name: /52 weeks/i });
    await userEvent.click(week52Button);

    await waitFor(() => {
      expect(portfolioService.getPortfolioPerformance).toHaveBeenCalledTimes(2);
    });

    const callArgs = vi.mocked(portfolioService.getPortfolioPerformance).mock.calls[
      vi.mocked(portfolioService.getPortfolioPerformance).mock.calls.length - 1
    ][0];
    // 52w should have a start_date approximately 365 days ago
    expect(callArgs).toBeDefined();
    expect(callArgs?.start_date).toBeTruthy();
    if (callArgs?.start_date) {
      const startDate = new Date(callArgs.start_date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(360);
      expect(daysDiff).toBeLessThanOrEqual(370);
    }
  });

  it('renders breadcrumbs correctly', async () => {
    vi.mocked(portfolioService.getPortfolioPerformance).mockResolvedValue({
      history_points: mockHistoryPoints,
    });

    renderPortfolioPerformance();

    await waitFor(() => {
      expect(screen.getByText(/Portfolio Performance/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });
});
