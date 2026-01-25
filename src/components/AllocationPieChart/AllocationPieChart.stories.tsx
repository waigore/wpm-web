import type { Meta, StoryObj } from '@storybook/react';
import { AllocationPieChart } from './AllocationPieChart';
import type { AllocationPosition } from '../../api/client';

const meta: Meta<typeof AllocationPieChart> = {
  title: 'Components/AllocationPieChart',
  component: AllocationPieChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AllocationPieChart>;

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
    allocation_percentage: 7.88,
    realized_gain_loss: null,
    metadata: {
      sector: 'Technology',
      industry: 'Consumer Electronics',
    },
  },
  {
    ticker: 'GOOGL',
    asset_type: 'Stock',
    quantity: 50,
    average_price: 2500.0,
    cost_basis: 125000.0,
    cost_basis_method: 'average',
    current_price: 2800.0,
    market_value: 140000.0,
    unrealized_gain_loss: 15000.0,
    allocation_percentage: 62.96,
    realized_gain_loss: 2000.0,
    metadata: {
      sector: 'Communication Services',
      industry: 'Internet Content & Information',
    },
  },
  {
    ticker: 'MSFT',
    asset_type: 'Stock',
    quantity: 75,
    average_price: 300.0,
    cost_basis: 22500.0,
    cost_basis_method: 'fifo',
    current_price: 380.5,
    market_value: 28537.5,
    unrealized_gain_loss: 6037.5,
    allocation_percentage: 12.84,
    realized_gain_loss: null,
    metadata: {
      sector: 'Technology',
      industry: 'Software—Infrastructure',
    },
  },
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
    allocation_percentage: 37.84,
    realized_gain_loss: null,
    metadata: {
      sector: 'Diversified',
      industry: 'Exchange Traded Fund',
    },
  },
  {
    ticker: 'BTC',
    asset_type: 'Crypto',
    quantity: 0.5,
    average_price: 45000.0,
    cost_basis: 22500.0,
    cost_basis_method: 'average',
    current_price: 50000.0,
    market_value: 25000.0,
    unrealized_gain_loss: 2500.0,
    allocation_percentage: 11.26,
    realized_gain_loss: null,
    metadata: {
      sector: 'Cryptocurrency',
      industry: 'Digital Currency',
    },
  },
];

export const Default: Story = {
  args: {
    assets: mockAssets,
  },
  parameters: {
    docs: {
      description: {
        story: '2-tier nested pie chart showing asset type allocation (inner ring) and individual asset allocation (outer ring).',
      },
    },
  },
};

export const SingleAssetType: Story = {
  args: {
    assets: mockAssets.filter((a) => a.asset_type === 'Stock'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart with only one asset type (Stock). Inner ring shows single type, outer ring shows individual stocks.',
      },
    },
  },
};

export const MultipleAssetTypes: Story = {
  args: {
    assets: mockAssets,
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart with multiple asset types (Stock, ETF, Crypto). Inner ring shows type distribution, outer ring shows individual assets grouped by type.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    assets: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no assets are provided.',
      },
    },
  },
};
