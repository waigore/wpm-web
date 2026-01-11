import type { Meta, StoryObj } from '@storybook/react';
import { LotTableRow } from './LotTableRow';
import { Table as TableComponent } from '../Table/Table';
import { TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';

const meta: Meta<typeof LotTableRow> = {
  title: 'Components/LotTableRow',
  component: LotTableRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LotTableRow>;

const mockLot = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  original_quantity: 50.0,
  remaining_quantity: 40.0,
  cost_basis: 7525.0,
  matched_sells: [],
};

export const Default: Story = {
  render: () => (
    <TableComponent>
      <TableHead>
        <MuiTableRow>
          <TableCell>Date</TableCell>
          <TableCell>Ticker</TableCell>
          <TableCell>Asset Type</TableCell>
          <TableCell align="right">Original Quantity</TableCell>
          <TableCell align="right">Remaining Quantity</TableCell>
          <TableCell align="right">Cost Basis</TableCell>
        </MuiTableRow>
      </TableHead>
      <TableBody>
        <LotTableRow lot={mockLot} />
      </TableBody>
    </TableComponent>
  ),
};

export const WithMatchedSells: Story = {
  render: () => {
    const lotWithSells = {
      ...mockLot,
      matched_sells: [
        {
          trade: {
            date: '2024-03-05',
            ticker: 'AAPL',
            asset_type: 'Stock',
            action: 'Sell',
            order_instruction: 'limit',
            quantity: 10.0,
            price: 160.00,
            broker: 'Fidelity',
          },
          consumed_quantity: 10.0,
        },
      ],
    };
    return (
      <TableComponent>
        <TableHead>
          <MuiTableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell align="right">Original Quantity</TableCell>
            <TableCell align="right">Remaining Quantity</TableCell>
            <TableCell align="right">Cost Basis</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          <LotTableRow lot={lotWithSells} />
        </TableBody>
      </TableComponent>
    );
  },
};

export const WithMultipleMatchedSells: Story = {
  render: () => {
    const lotWithMultipleSells = {
      ...mockLot,
      matched_sells: [
        {
          trade: {
            date: '2024-03-05',
            ticker: 'AAPL',
            asset_type: 'Stock',
            action: 'Sell',
            order_instruction: 'limit',
            quantity: 10.0,
            price: 160.00,
            broker: 'Fidelity',
          },
          consumed_quantity: 10.0,
        },
        {
          trade: {
            date: '2024-03-10',
            ticker: 'AAPL',
            asset_type: 'Stock',
            action: 'Sell',
            order_instruction: 'market',
            quantity: 5.0,
            price: 165.00,
            broker: 'Charles Schwab',
          },
          consumed_quantity: 5.0,
        },
      ],
    };
    return (
      <TableComponent>
        <TableHead>
          <MuiTableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell align="right">Original Quantity</TableCell>
            <TableCell align="right">Remaining Quantity</TableCell>
            <TableCell align="right">Cost Basis</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          <LotTableRow lot={lotWithMultipleSells} />
        </TableBody>
      </TableComponent>
    );
  },
};

export const MultipleLots: Story = {
  render: () => {
    const lots = [
      mockLot,
      {
        ...mockLot,
        date: '2024-02-10',
        original_quantity: 50.0,
        remaining_quantity: 50.0,
        matched_sells: [],
      },
      {
        ...mockLot,
        date: '2024-03-01',
        original_quantity: 30.0,
        remaining_quantity: 20.0,
        matched_sells: [
          {
            trade: {
              date: '2024-03-15',
              ticker: 'AAPL',
              asset_type: 'Stock',
              action: 'Sell',
              order_instruction: 'market',
              quantity: 10.0,
              price: 170.00,
              broker: 'TD Ameritrade',
            },
            consumed_quantity: 10.0,
          },
        ],
      },
    ];

    return (
      <TableComponent>
        <TableHead>
          <MuiTableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell align="right">Original Quantity</TableCell>
            <TableCell align="right">Remaining Quantity</TableCell>
            <TableCell align="right">Cost Basis</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          {lots.map((lot, index) => (
            <LotTableRow key={index} lot={lot} />
          ))}
        </TableBody>
      </TableComponent>
    );
  },
};






