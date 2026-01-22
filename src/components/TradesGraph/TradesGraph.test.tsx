import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TradesGraph } from './TradesGraph';

const mockPrices = [
  { date: '2025-01-02', price: 170.25 },
  { date: '2025-01-03', price: 171.1 },
];

const mockTrades = [
  {
    date: '2025-01-02',
    ticker: 'AAPL',
    asset_type: 'Stock',
    action: 'Buy',
    order_instruction: 'limit',
    quantity: 10,
    price: 170.25,
    broker: 'Fidelity',
  },
  {
    date: '2025-01-03',
    ticker: 'AAPL',
    asset_type: 'Stock',
    action: 'Sell',
    order_instruction: 'market',
    quantity: 5,
    price: 171.1,
    broker: 'Schwab',
  },
];

describe('TradesGraph', () => {
  it('renders title and controls', () => {
    const handleGranularityChange = vi.fn();
    const handleDateRangeChange = vi.fn();

    render(
      <TradesGraph
        ticker="AAPL"
        prices={mockPrices as any}
        currentPrice={171.1}
        trades={mockTrades as any}
        granularity="daily"
        dateRange="ytd"
        onGranularityChange={handleGranularityChange}
        onDateRangeChange={handleDateRangeChange}
      />
    );

    expect(screen.getByText(/AAPL: Trades Graph/i)).toBeInTheDocument();
    expect(screen.getByText(/Granularity/i)).toBeInTheDocument();
    expect(screen.getByText(/Date Range/i)).toBeInTheDocument();
  });

  it('shows empty state when no price data', () => {
    const handleGranularityChange = vi.fn();
    const handleDateRangeChange = vi.fn();

    render(
      <TradesGraph
        ticker="AAPL"
        prices={[] as any}
        currentPrice={null}
        trades={[] as any}
        granularity="daily"
        dateRange="ytd"
        onGranularityChange={handleGranularityChange}
        onDateRangeChange={handleDateRangeChange}
      />
    );

    expect(
      screen.getByText(/No price data available for the selected date range/i)
    ).toBeInTheDocument();
  });

  it('uses allTrades when provided', () => {
    const handleGranularityChange = vi.fn();
    const handleDateRangeChange = vi.fn();
    const allTrades = [
      ...mockTrades,
      {
        date: '2025-01-04',
        ticker: 'AAPL',
        asset_type: 'Stock',
        action: 'Buy',
        order_instruction: 'limit',
        quantity: 20,
        price: 172.0,
        broker: 'Fidelity',
      },
    ];

    render(
      <TradesGraph
        ticker="AAPL"
        prices={mockPrices as any}
        currentPrice={171.1}
        allTrades={allTrades as any}
        visibleTrades={mockTrades as any}
        granularity="daily"
        dateRange="ytd"
        onGranularityChange={handleGranularityChange}
        onDateRangeChange={handleDateRangeChange}
      />
    );

    expect(screen.getByText(/AAPL: Trades Graph/i)).toBeInTheDocument();
  });

  it('falls back to trades prop when allTrades not provided', () => {
    const handleGranularityChange = vi.fn();
    const handleDateRangeChange = vi.fn();

    render(
      <TradesGraph
        ticker="AAPL"
        prices={mockPrices as any}
        currentPrice={171.1}
        trades={mockTrades as any}
        granularity="daily"
        dateRange="ytd"
        onGranularityChange={handleGranularityChange}
        onDateRangeChange={handleDateRangeChange}
      />
    );

    expect(screen.getByText(/AAPL: Trades Graph/i)).toBeInTheDocument();
  });
});

