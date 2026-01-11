import type { Meta, StoryObj } from '@storybook/react';
import { AssetLots } from './AssetLots';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof AssetLots> = {
  title: 'Pages/AssetLots',
  component: AssetLots,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/portfolio/lots/AAPL']}>
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
type Story = StoryObj<typeof AssetLots>;

/**
 * Default asset lots page showing lots for AAPL.
 * Uses MSW handlers for mock data. Displays lots in chronological order (default sort by date ascending).
 * Matched sells are displayed as sub-rows under each lot when present.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Asset lots page displaying all lots for a specific asset (AAPL) with pagination and sorting support. Default sort is by date ascending (chronological order). Matched sells are displayed as indented sub-rows under their parent lot.',
      },
    },
  },
};

/**
 * Asset lots page for a different ticker (GOOGL).
 * Shows how the page adapts to different assets.
 */
export const DifferentTicker: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/portfolio/lots/GOOGL']}>
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
        story: 'Asset lots page for GOOGL showing lots specific to that asset.',
      },
    },
  },
};






