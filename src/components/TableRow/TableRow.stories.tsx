import type { Meta, StoryObj } from '@storybook/react';
import { TableRow } from './TableRow';
import { Table as TableComponent } from '../Table/Table';
import { TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof TableRow> = {
  title: 'Components/TableRow',
  component: TableRow,
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
type Story = StoryObj<typeof TableRow>;

const mockPosition = {
  ticker: 'AAPL',
  asset_type: 'Stock',
  quantity: 100.0,
  average_price: 150.50,
  cost_basis: 15050.0,
  cost_basis_method: 'fifo' as const,
  current_price: 175.25,
  market_value: 17525.0,
  unrealized_gain_loss: 2475.0,
};

export const Default: Story = {
  render: () => (
    <TableComponent>
      <TableHead>
        <MuiTableRow>
          <TableCell>Ticker</TableCell>
          <TableCell>Asset Type</TableCell>
          <TableCell align="right">Quantity</TableCell>
          <TableCell align="right">Average Price</TableCell>
          <TableCell align="right">Cost Basis</TableCell>
          <TableCell align="right">Current Price</TableCell>
          <TableCell align="right">Market Value</TableCell>
          <TableCell align="right">Gain/Loss</TableCell>
          <TableCell align="right">Actions</TableCell>
        </MuiTableRow>
      </TableHead>
      <TableBody>
        <TableRow position={mockPosition} />
      </TableBody>
    </TableComponent>
  ),
};

export const MultipleRows: Story = {
  render: () => {
    const positions = [
      mockPosition,
      {
        ...mockPosition,
        ticker: 'GOOGL',
        quantity: 50.0,
        average_price: 2500.0,
        cost_basis: 125000.0,
        current_price: 2800.0,
        market_value: 140000.0,
        unrealized_gain_loss: 15000.0,
      },
      {
        ...mockPosition,
        ticker: 'MSFT',
        quantity: 75.0,
        average_price: 300.0,
        cost_basis: 22500.0,
        current_price: 380.50,
        market_value: 28537.5,
        unrealized_gain_loss: 6037.5,
      },
    ];

    return (
      <TableComponent>
        <TableHead>
          <MuiTableRow>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Average Price</TableCell>
            <TableCell align="right">Cost Basis</TableCell>
            <TableCell align="right">Current Price</TableCell>
            <TableCell align="right">Market Value</TableCell>
            <TableCell align="right">Gain/Loss</TableCell>
            <TableCell align="right">Actions</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          {positions.map((position, index) => (
            <TableRow key={index} position={position} />
          ))}
        </TableBody>
      </TableComponent>
    );
  },
};

/**
 * TableRow with menu showing the three-dot menu button.
 * Clicking the menu reveals the "Trades" option which navigates to the asset trades page.
 */
export const WithMenu: Story = {
  render: () => (
    <TableComponent>
      <TableHead>
        <MuiTableRow>
          <TableCell>Ticker</TableCell>
          <TableCell>Asset Type</TableCell>
          <TableCell align="right">Quantity</TableCell>
          <TableCell align="right">Average Price</TableCell>
          <TableCell align="right">Cost Basis</TableCell>
          <TableCell align="right">Current Price</TableCell>
          <TableCell align="right">Market Value</TableCell>
          <TableCell align="right">Gain/Loss</TableCell>
          <TableCell align="right">Actions</TableCell>
        </MuiTableRow>
      </TableHead>
      <TableBody>
        <TableRow position={mockPosition} />
      </TableBody>
    </TableComponent>
  ),
  parameters: {
    docs: {
      description: {
        story: 'TableRow with three-dot menu button in the Actions column. Clicking the menu button opens a menu with a "Trades" option that navigates to the asset trades page.',
      },
    },
  },
};

