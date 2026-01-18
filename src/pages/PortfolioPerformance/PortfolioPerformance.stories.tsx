import type { Meta, StoryObj } from '@storybook/react';
import { PortfolioPerformance } from './PortfolioPerformance';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof PortfolioPerformance> = {
  title: 'Pages/PortfolioPerformance',
  component: PortfolioPerformance,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/portfolio/performance']}>
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
type Story = StoryObj<typeof PortfolioPerformance>;

/**
 * Default portfolio performance page showing performance graph with weekly granularity and portfolio start date range.
 * Uses MSW handlers for mock data. Displays line chart of portfolio total market value over time.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio performance page displaying a line graph of portfolio total market value over time. Default granularity is weekly and default date range is portfolio start.',
      },
    },
  },
};

/**
 * Portfolio performance page with weekly granularity.
 * Shows how the graph adapts to weekly data points.
 */
export const WeeklyGranularity: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio performance page with weekly granularity selected. The graph shows Monday-based weekly data points.',
      },
    },
  },
};

/**
 * Portfolio performance page with monthly granularity.
 * Shows how the graph adapts to monthly data points.
 */
export const MonthlyGranularity: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio performance page with monthly granularity selected. The graph shows first-of-month data points.',
      },
    },
  },
};

/**
 * Portfolio performance page with 52-week date range.
 * Shows performance over the past year.
 */
export const YearRange: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio performance page with 52-week date range selected. Shows performance over the past year (365 days).',
      },
    },
  },
};

/**
 * Portfolio performance page with portfolio start date range.
 * Shows performance from the beginning of the portfolio.
 */
export const PortfolioStartRange: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Portfolio performance page with portfolio start date range selected. Shows performance from the beginning of the portfolio (API default).',
      },
    },
  },
};
