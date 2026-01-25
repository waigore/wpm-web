import type { Meta, StoryObj } from '@storybook/react';
import { AllocationTreemap } from './AllocationTreemap';
import type { AllocationPosition } from '../../api/client';

const meta: Meta<typeof AllocationTreemap> = {
  title: 'Components/AllocationTreemap',
  component: AllocationTreemap,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AllocationTreemap>;

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

/**
 * Default treemap showing multiple asset types and individual assets.
 * Hierarchical structure with asset types as parent nodes and individual assets as leaf nodes.
 */
export const Default: Story = {
  args: {
    assets: mockAssets,
  },
  parameters: {
    docs: {
      description: {
        story: 'Treemap visualization showing portfolio allocation. Parent nodes represent asset types, leaf nodes represent individual assets. Cell size is proportional to market value.',
      },
    },
  },
};

/**
 * Treemap with only one asset type (Stock).
 * Shows how the treemap handles a single category.
 */
export const SingleAssetType: Story = {
  args: {
    assets: mockAssets.filter((a) => a.asset_type === 'Stock'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Treemap with only one asset type (Stock). All assets are grouped under a single parent node.',
      },
    },
  },
};

/**
 * Treemap with multiple asset types.
 * Demonstrates the hierarchical structure with different asset categories.
 */
export const MultipleAssetTypes: Story = {
  args: {
    assets: mockAssets,
  },
  parameters: {
    docs: {
      description: {
        story: 'Treemap with multiple asset types (Stock, ETF, Crypto). Each asset type is a parent node containing individual assets as children.',
      },
    },
  },
};

/**
 * Empty state when no assets are provided.
 */
export const Empty: Story = {
  args: {
    assets: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state displayed when no assets are provided.',
      },
    },
  },
};

/**
 * Treemap with filtered data (only Stock assets).
 * Shows how the treemap updates when filters are applied.
 */
export const Filtered: Story = {
  args: {
    assets: mockAssets.filter((a) => a.asset_type === 'Stock'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Treemap with filtered data showing only Stock assets. Demonstrates how the visualization adapts to filtered subsets.',
      },
    },
  },
};
