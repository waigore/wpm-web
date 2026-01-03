import type { Meta, StoryObj } from '@storybook/react';
import { TradeTableRow } from './TradeTableRow';
import { Table as TableComponent } from '../Table/Table';
import { TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';

const meta: Meta<typeof TradeTableRow> = {
  title: 'Components/TradeTableRow',
  component: TradeTableRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TradeTableRow>;

const mockTrade = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  action: 'Buy',
  order_instruction: 'limit',
  quantity: 50.0,
  price: 150.50,
  broker: 'Fidelity',
};

export const Default: Story = {
  render: () => (
    <TableComponent>
      <TableHead>
        <MuiTableRow>
          <TableCell>Date</TableCell>
          <TableCell>Ticker</TableCell>
          <TableCell>Asset Type</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Broker</TableCell>
          <TableCell>Order Instruction</TableCell>
          <TableCell align="right">Quantity</TableCell>
          <TableCell align="right">Price</TableCell>
        </MuiTableRow>
      </TableHead>
      <TableBody>
        <TradeTableRow trade={mockTrade} />
      </TableBody>
    </TableComponent>
  ),
};

export const BuyTrade: Story = {
  render: () => (
    <TableComponent>
      <TableHead>
        <MuiTableRow>
          <TableCell>Date</TableCell>
          <TableCell>Ticker</TableCell>
          <TableCell>Asset Type</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Broker</TableCell>
          <TableCell>Order Instruction</TableCell>
          <TableCell align="right">Quantity</TableCell>
          <TableCell align="right">Price</TableCell>
        </MuiTableRow>
      </TableHead>
      <TableBody>
        <TradeTableRow trade={mockTrade} />
      </TableBody>
    </TableComponent>
  ),
};

export const SellTrade: Story = {
  render: () => {
    const sellTrade = {
      ...mockTrade,
      action: 'Sell',
      order_instruction: 'market',
    };
    return (
      <TableComponent>
        <TableHead>
          <MuiTableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Broker</TableCell>
            <TableCell>Order Instruction</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          <TradeTableRow trade={sellTrade} />
        </TableBody>
      </TableComponent>
    );
  },
};

export const MultipleTrades: Story = {
  render: () => {
    const trades = [
      mockTrade,
      {
        ...mockTrade,
        date: '2024-02-10',
        quantity: 30.0,
        price: 160.0,
        broker: 'Charles Schwab',
      },
      {
        ...mockTrade,
        date: '2024-03-05',
        action: 'Sell',
        order_instruction: 'limit',
        quantity: 10.0,
        price: 170.0,
        broker: 'TD Ameritrade',
      },
    ];

    return (
      <TableComponent>
        <TableHead>
          <MuiTableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Broker</TableCell>
            <TableCell>Order Instruction</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          {trades.map((trade, index) => (
            <TradeTableRow key={index} trade={trade} />
          ))}
        </TableBody>
      </TableComponent>
    );
  },
};

