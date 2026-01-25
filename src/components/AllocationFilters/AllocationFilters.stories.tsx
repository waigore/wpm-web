import type { Meta, StoryObj } from '@storybook/react';
import { AllocationFilters } from './AllocationFilters';

const meta: Meta<typeof AllocationFilters> = {
  title: 'Components/AllocationFilters',
  component: AllocationFilters,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AllocationFilters>;

export const Default: Story = {
  args: {
    availableAssetTypes: ['Stock', 'ETF', 'Crypto', 'Bond'],
    availableTickers: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'VTI', 'BTC', 'ETH'],
    selectedAssetTypes: [],
    selectedTickers: [],
    onAssetTypesChange: () => {},
    onTickersChange: () => {},
  },
};

export const WithSelections: Story = {
  args: {
    availableAssetTypes: ['Stock', 'ETF', 'Crypto', 'Bond'],
    availableTickers: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'VTI', 'BTC', 'ETH'],
    selectedAssetTypes: ['Stock', 'ETF'],
    selectedTickers: ['AAPL', 'MSFT'],
    onAssetTypesChange: () => {},
    onTickersChange: () => {},
  },
};

export const SingleAssetType: Story = {
  args: {
    availableAssetTypes: ['Stock'],
    availableTickers: ['AAPL', 'MSFT', 'GOOGL'],
    selectedAssetTypes: ['Stock'],
    selectedTickers: [],
    onAssetTypesChange: () => {},
    onTickersChange: () => {},
  },
};

/**
 * Multiple tickers selected - demonstrates that all options remain available.
 * Users can select multiple tickers and all options stay visible.
 */
export const MultipleTickersSelected: Story = {
  args: {
    availableAssetTypes: ['Stock', 'ETF', 'Crypto', 'Bond'],
    availableTickers: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'VTI', 'BTC', 'ETH', 'VOO'],
    selectedAssetTypes: [],
    selectedTickers: ['AAPL', 'MSFT', 'GOOGL', 'TSLA'],
    onAssetTypesChange: () => {},
    onTickersChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'AllocationFilters with multiple tickers selected. All ticker options remain available in the dropdown, allowing users to select additional tickers or deselect existing ones.',
      },
    },
  },
};

/**
 * Mixed selections - asset type and ticker from different categories.
 * Demonstrates independent filter behavior.
 */
export const MixedSelections: Story = {
  args: {
    availableAssetTypes: ['Stock', 'ETF', 'Crypto', 'Bond'],
    availableTickers: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY', 'VTI', 'BTC', 'ETH', 'VOO'],
    selectedAssetTypes: ['Crypto'],
    selectedTickers: ['VOO', 'SPY'],
    onAssetTypesChange: () => {},
    onTickersChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'AllocationFilters with mixed selections - Crypto asset type selected along with ETF tickers (VOO, SPY). Demonstrates that asset types and tickers are independent filters that can be combined in any way.',
      },
    },
  },
};
