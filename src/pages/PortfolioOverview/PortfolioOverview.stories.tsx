import type { Meta, StoryObj } from '@storybook/react';
import { PortfolioOverview } from './PortfolioOverview';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof PortfolioOverview> = {
  title: 'Pages/PortfolioOverview',
  component: PortfolioOverview,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PortfolioOverview>;

/**
 * Default portfolio overview with portfolio totals displayed in a single row
 * underneath the page title. Totals include Market Value, Unrealized P/L (colored),
 * and Cost Basis. Uses MSW handlers for mock data.
 */
export const Default: Story = {};

/**
 * Portfolio overview showing the totals row with formatted currency values.
 * The Unrealized P/L is styled in green for positive values, red for negative values.
 */
export const WithTotals: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio totals are displayed in a single row with three cards: Market Value, Unrealized P/L (with color coding), and Cost Basis. All values are formatted as currency.',
      },
    },
  },
};

