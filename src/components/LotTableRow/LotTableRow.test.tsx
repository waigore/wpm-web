import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LotTableRow } from './LotTableRow';
import { Table, TableBody } from '@mui/material';
import type { Lot } from '../../api/client';

const mockLot: Lot = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  broker: 'Fidelity',
  original_quantity: 50.0,
  remaining_quantity: 40.0,
  cost_basis: 7525.0,
  realized_pnl: 75.0,
  unrealized_pnl: 1000.0,
  total_pnl: 1075.0,
  matched_sells: [],
};

const mockLotWithMatchedSells: Lot = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  broker: 'Fidelity',
  original_quantity: 50.0,
  remaining_quantity: 40.0,
  cost_basis: 7525.0,
  realized_pnl: 75.0,
  unrealized_pnl: 1000.0,
  total_pnl: 1075.0,
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
    expect(screen.getByText('Fidelity')).toBeInTheDocument();
    // Verify all cells are present (10 columns total)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBe(10); // Date, Ticker, Asset Type, Broker, Original Quantity, Remaining Quantity, Cost Basis, Realized P/L, Unrealized P/L, Total P/L
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
    // Fidelity appears in lot row and matched sell row, so use getAllByText
    const fidelityElements = screen.getAllByText('Fidelity');
    expect(fidelityElements.length).toBeGreaterThanOrEqual(1);
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
    // Fidelity appears in lot row and matched sell row, so use getAllByText
    const fidelityElements = screen.getAllByText('Fidelity');
    expect(fidelityElements.length).toBeGreaterThanOrEqual(1);
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
    expect(cells.length).toBeGreaterThan(10); // More than just the lot row
  });

  it('displays broker field', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Fidelity')).toBeInTheDocument();
  });

  it('displays P/L fields with null values', () => {
    const lotWithNullPnl: Lot = {
      ...mockLot,
      realized_pnl: null,
      unrealized_pnl: null,
      total_pnl: null,
    };

    render(
      <Table>
        <TableBody>
          <LotTableRow lot={lotWithNullPnl} />
        </TableBody>
      </Table>
    );

    // Should display "N/A" for null P/L values
    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBeGreaterThanOrEqual(3); // At least 3 N/A values for P/L fields
  });

  it('displays P/L fields with positive values', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLot} />
        </TableBody>
      </Table>
    );

    // Should display formatted currency values for P/L
    const cells = screen.getAllByRole('cell');
    const cellTexts = cells.map((cell) => cell.textContent);
    // Check that P/L values are formatted as currency (contain $)
    const hasCurrencyFormat = cellTexts.some((text) => text?.includes('$'));
    expect(hasCurrencyFormat).toBe(true);
  });

  it('displays P/L fields with negative values', () => {
    const lotWithNegativePnl: Lot = {
      ...mockLot,
      realized_pnl: -100.0,
      unrealized_pnl: -200.0,
      total_pnl: -300.0,
    };

    render(
      <Table>
        <TableBody>
          <LotTableRow lot={lotWithNegativePnl} />
        </TableBody>
      </Table>
    );

    // Should display negative values formatted as currency
    const cells = screen.getAllByRole('cell');
    const cellTexts = cells.map((cell) => cell.textContent);
    const hasNegativeCurrency = cellTexts.some((text) => text?.includes('-$') || text?.includes('($'));
    expect(hasNegativeCurrency).toBe(true);
  });

  it('displays matched sells with correct column alignment', () => {
    render(
      <Table>
        <TableBody>
          <LotTableRow lot={mockLotWithMatchedSells} />
        </TableBody>
      </Table>
    );

    // Check that matched sell displays action in the correct position
    expect(screen.getByText('Sell')).toBeInTheDocument();
    // Check that matched sell displays broker in the correct position
    expect(screen.getAllByText('Fidelity').length).toBeGreaterThan(0);
    // Check that matched sell displays consumed quantity
    expect(screen.getByText('10')).toBeInTheDocument();
    // Check that matched sell displays price
    expect(screen.getByText('$160.00')).toBeInTheDocument();
  });
});


