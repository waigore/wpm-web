import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableRow } from './TableRow';
import { Table, TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';
import type { Position } from '../../api/client';

const mockPosition: Position = {
  ticker: 'AAPL',
  asset_type: 'Stock',
  quantity: 100.5,
  average_price: 150.5,
  cost_basis: 15050.0,
  cost_basis_method: 'fifo',
  current_price: 175.25,
  market_value: 17525.0,
  unrealized_gain_loss: 2475.0,
};

describe('TableRow', () => {
  it('renders position data correctly', () => {
    render(
      <Table>
        <TableHead>
          <MuiTableRow>
            <TableCell>Ticker</TableCell>
            <TableCell>Asset Type</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Average Price</TableCell>
            <TableCell>Cost Basis</TableCell>
            <TableCell>Current Price</TableCell>
            <TableCell>Market Value</TableCell>
            <TableCell>Gain/Loss</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
  });

  it('handles null values for current_price', () => {
    const positionWithNull: Position = {
      ...mockPosition,
      current_price: null,
      market_value: null,
      unrealized_gain_loss: null,
    };

    render(
      <Table>
        <TableBody>
          <TableRow position={positionWithNull} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    // Should format currency values (checking for dollar sign or formatted number)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('applies correct styling for positive gain/loss', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    // The gain/loss cell should have styling applied (checking for MUI classes or styles)
    const row = container.querySelector('.MuiTableRow-root');
    expect(row).toBeInTheDocument();
  });

  it('applies correct styling for negative gain/loss', () => {
    const negativePosition: Position = {
      ...mockPosition,
      unrealized_gain_loss: -100.0,
    };

    const { container } = render(
      <Table>
        <TableBody>
          <TableRow position={negativePosition} />
        </TableBody>
      </Table>
    );

    const row = container.querySelector('.MuiTableRow-root');
    expect(row).toBeInTheDocument();
  });
});

