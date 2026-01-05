import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const PortfolioOverview: Story = {
  args: {
    items: [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio' },
    ],
  },
};

export const AssetTrades: Story = {
  args: {
    items: [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'AAPL' },
    ],
  },
};

export const AssetTradesDifferentTicker: Story = {
  args: {
    items: [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'TSLA' },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Portfolio' }],
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const MultipleLevels: Story = {
  args: {
    items: [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'Asset Trades', path: '/portfolio/asset/AAPL' },
      { label: 'AAPL' },
    ],
  },
};





