import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AllocationPieChart } from './AllocationPieChart';
import type { AllocationPosition } from '../../api/client';

const mockAssets: AllocationPosition[] = [
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

describe('AllocationPieChart', () => {
  it('renders chart with assets', () => {
    const { container } = render(<AllocationPieChart assets={mockAssets} />);

    // Check that the chart container is rendered
    const chartContainer = container.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('displays empty state when no assets', () => {
    render(<AllocationPieChart assets={[]} />);

    expect(screen.getByText('No assets to display')).toBeInTheDocument();
  });

  it('handles assets with null market values', () => {
    const assetsWithNull: AllocationPosition[] = [
      {
        ticker: 'AAPL',
        asset_type: 'Stock',
        quantity: 100,
        average_price: 150.0,
        cost_basis: 15000.0,
        cost_basis_method: 'fifo',
        current_price: null,
        market_value: null,
        unrealized_gain_loss: null,
        allocation_percentage: null,
        realized_gain_loss: null,
        metadata: null,
      },
    ];

    const { container } = render(<AllocationPieChart assets={assetsWithNull} />);

    // Assets with null market values should still render chart (with 0 value)
    const chartContainer = container.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });

  it('handles multiple asset types', () => {
    const multiTypeAssets: AllocationPosition[] = [
      ...mockAssets,
      {
        ticker: 'SPY',
        asset_type: 'ETF',
        quantity: 200,
        average_price: 400.0,
        cost_basis: 80000.0,
        cost_basis_method: 'average',
        current_price: 420.0,
        market_value: 84000.0,
        unrealized_gain_loss: 4000.0,
        allocation_percentage: 70.0,
        realized_gain_loss: null,
        metadata: null,
      },
    ];

    const { container } = render(<AllocationPieChart assets={multiTypeAssets} />);

    const chartContainer = container.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
  });
});
