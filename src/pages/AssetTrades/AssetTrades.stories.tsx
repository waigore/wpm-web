import type { Meta, StoryObj } from '@storybook/react';
import { AssetTrades } from './AssetTrades';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof AssetTrades> = {
  title: 'Pages/AssetTrades',
  component: AssetTrades,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/portfolio/trades/AAPL']}>
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
type Story = StoryObj<typeof AssetTrades>;

/**
 * Default asset trades page showing trades for AAPL.
 * Uses MSW handlers for mock data. Displays trades in chronological order (default sort by date ascending).
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Asset trades page displaying all trades for a specific asset (AAPL) with pagination and sorting support. Default sort is by date ascending (chronological order).',
      },
    },
  },
};

/**
 * Asset trades page for a different ticker (GOOGL).
 * Shows how the page adapts to different assets.
 */
export const DifferentTicker: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/portfolio/trades/GOOGL']}>
        <BrowserRouter>
          <AuthProvider>
            <Story />
          </AuthProvider>
        </BrowserRouter>
      </MemoryRouter>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Asset trades page for GOOGL showing trades specific to that asset.',
      },
    },
  },
};

