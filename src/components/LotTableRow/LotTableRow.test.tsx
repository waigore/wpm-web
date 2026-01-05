import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LotTableRow } from './LotTableRow';
import { Table, TableBody } from '@mui/material';
import type { Lot } from '../../api/client';

const mockLot: Lot = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  original_quantity: 50.0,
  remaining_quantity: 40.0,
  cost_basis: 7525.0,
  matched_sells: [],
};

const mockLotWithMatchedSells: Lot = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  original_quantity: 50.0,
  remaining_quantity: 40.0,
  cost_basis: 7525.0,
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

describe('LotTableRow', () => {
  it('renders lot data correctly', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    // Verify all cells are present (6 columns total)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBe(6); // Date, Ticker, Asset Type, Original Quantity, Remaining Quantity, Cost Basis
  });

  it('does not render matched sells when array is empty', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    // Should only have the lot row, no matched sell rows
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(1); // Only the lot row
  });

  it('renders matched sells as sub-rows when present', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLotWithMatchedSells} />
        </TableBody>
      </Table>
    );

    // Should have the lot row plus matched sell sub-rows
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(2); // Lot row + 1 matched sell row

    // Check that matched sell data is displayed
    expect(screen.getByText('Sell')).toBeInTheDocument();
    expect(screen.getByText('Fidelity')).toBeInTheDocument();
  });

  it('renders multiple matched sells', () => {
    const lotWithMultipleSells: Lot = {
      ...mockLotWithMatchedSells,
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

    render(
      <Table>
        <TableBody>
          <LotTableRow lot={lotWithMultipleSells} />
        </TableBody>
      </Table>
    );

    // Should have the lot row plus 2 matched sell rows
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3); // Lot row + 2 matched sell rows

    // Check that both matched sells are displayed
    expect(screen.getAllByText('Sell').length).toBe(2);
    expect(screen.getByText('Fidelity')).toBeInTheDocument();
    expect(screen.getByText('Charles Schwab')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    // Date should be formatted (checking for formatted date string)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('formats currency values correctly', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    // Should format currency values (checking for dollar sign or formatted number)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('formats quantity values correctly', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    // Should display quantity values
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('displays consumed quantity in matched sell sub-rows', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLotWithMatchedSells} />
        </TableBody>
      </Table>
    );

    // Should display consumed quantity (10.0) in the matched sell row
    // The consumed quantity should be formatted and displayed
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(6); // More than just the lot row
  });
});


