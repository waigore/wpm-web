import type { Meta, StoryObj } from '@storybook/react';
import { PortfolioAllocation } from './PortfolioAllocation';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof PortfolioAllocation> = {
  title: 'Pages/PortfolioAllocation',
  component: PortfolioAllocation,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/portfolio/allocation']}>
        <BrowserRouter>
          <AuthProvider>
            <Story />
          </AuthProvider>
        </BrowserRouter>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PortfolioAllocation>;

/**
 * Default portfolio allocation page showing 2-tier nested pie chart with filters.
 * Uses MSW handlers for mock data. Displays asset type allocation (inner ring) and individual asset allocation (outer ring).
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio allocation page displaying a 2-tier nested pie chart. Inner ring shows asset types, outer ring shows individual assets. Includes filters for asset types and tickers.',
      },
    },
  },
};

/**
 * Portfolio allocation page with asset type filter applied.
 * Shows only Stock assets.
 */
export const FilteredByAssetType: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio allocation page with asset type filter applied (e.g., showing only Stock assets). Chart updates dynamically based on filter selection.',
      },
    },
  },
};

/**
 * Portfolio allocation page with ticker filter applied.
 * Shows only selected tickers.
 */
export const FilteredByTicker: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio allocation page with ticker filter applied. Chart shows only the selected tickers with recalculated allocation percentages.',
      },
    },
  },
};

/**
 * Portfolio allocation page with both filters applied.
 * Shows intersection of asset type and ticker filters.
 */
export const FilteredByBoth: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio allocation page with both asset type and ticker filters applied. Chart shows only assets matching both criteria.',
      },
    },
  },
};

/**
 * Portfolio allocation page with multiple tickers selected.
 * Demonstrates that selecting one ticker doesn't remove others from options.
 */
export const MultipleTickersSelected: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio allocation page with multiple tickers selected simultaneously. All ticker options remain available for selection even after making selections.',
      },
    },
  },
};

/**
 * Portfolio allocation page with mixed selections.
 * Shows asset type from one category and ticker from another (e.g., Crypto type + VOO ticker).
 */
export const MixedSelections: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio allocation page with mixed filter selections - asset type from one category and ticker from another. Demonstrates that filters are independent and can be combined in any way.',
      },
    },
  },
};
