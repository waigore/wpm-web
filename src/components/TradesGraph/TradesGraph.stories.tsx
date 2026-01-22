import type { Meta, StoryObj } from '@storybook/react';
import { TradesGraph } from './TradesGraph';

const meta: Meta<typeof TradesGraph> = {
  title: 'Components/TradesGraph',
  component: TradesGraph,
};

export default meta;

type Story = StoryObj<typeof TradesGraph>;

const basePrices = [
  { date: '2025-01-02', price: 170.25 },
  { date: '2025-01-03', price: 171.1 },
  { date: '2025-01-06', price: 172.5 },
];

const baseTrades = [
  {
    date: '2025-01-02',
    ticker: 'AAPL',
    asset_type: 'Stock',
    action: 'Buy',
    order_instruction: 'limit',
    quantity: 10,
    price: 170.25,
    broker: 'Fidelity',
  },
  {
    date: '2025-01-03',
    ticker: 'AAPL',
    asset_type: 'Stock',
    action: 'Sell',
    order_instruction: 'market',
    quantity: 5,
    price: 171.1,
    broker: 'Schwab',
  },
];

export const DailyYTD: Story = {
  args: {
    ticker: 'AAPL',
    prices: basePrices as any,
    currentPrice: 172.5,
    trades: baseTrades as any,
    granularity: 'daily',
    dateRange: 'ytd',
    onGranularityChange: () => {},
    onDateRangeChange: () => {},
  },
};

export const WeeklyOneYear: Story = {
  args: {
    ticker: 'AAPL',
    prices: basePrices as any,
    currentPrice: 172.5,
    trades: baseTrades as any,
    granularity: 'weekly',
    dateRange: '1y',
    onGranularityChange: () => {},
    onDateRangeChange: () => {},
  },
};

