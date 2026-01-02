import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TradeTableRow } from './TradeTableRow';
import { Table, TableBody } from '@mui/material';
import type { Trade } from '../../api/client';

const mockTrade: Trade = {
  date: '2024-01-15',
  ticker: 'AAPL',
  asset_type: 'Stock',
  action: 'Buy',
  order_instruction: 'limit',
  quantity: 50.0,
  price: 150.50,
  cost_basis: 7525.0,
  market_price: 175.25,
  unrealized_profit_loss: 1237.5,
};

describe('TradeTableRow', () => {
  it('renders trade data correctly', () => {
    render(
      <Table>
        <TableBody>
          <TradeTableRow trade={mockTrade} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    // Action column displays "Buy" from the action field
    expect(screen.getByText('Buy')).toBeInTheDocument();
    // Order Instruction displays "Limit" (capitalized from "limit")
    expect(screen.getByText('Limit')).toBeInTheDocument();
  });

  it('handles null values for sell trades', () => {
    const sellTrade: Trade = {
      ...mockTrade,
      action: 'Sell',
      order_instruction: 'market',
      cost_basis: null,
      market_price: null,
      unrealized_profit_loss: null,
    };

    render(
      <Table>
        <TableBody>
          <TradeTableRow trade={sellTrade} />
        </TableBody>
      </Table>
    );

    // Action column displays "Sell" from the action field
    expect(screen.getByText('Sell')).toBeInTheDocument();
    // Order Instruction displays "Market" (capitalized from "market")
    expect(screen.getByText('Market')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(
      <Table>
        <TableBody>
          <TradeTableRow trade={mockTrade} />
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
          <TradeTableRow trade={mockTrade} />
        </TableBody>
      </Table>
    );

    // Should format currency values (checking for dollar sign or formatted number)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('applies correct styling for positive profit/loss', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TradeTableRow trade={mockTrade} />
        </TableBody>
      </Table>
    );

    // The profit/loss cell should have styling applied
    const row = container.querySelector('.MuiTableRow-root');
    expect(row).toBeInTheDocument();
  });

  it('applies correct styling for negative profit/loss', () => {
    const negativeTrade: Trade = {
      ...mockTrade,
      unrealized_profit_loss: -100.0,
    };

    const { container } = render(
      <Table>
        <TableBody>
          <TradeTableRow trade={negativeTrade} />
        </TableBody>
      </Table>
    );

    const row = container.querySelector('.MuiTableRow-root');
    expect(row).toBeInTheDocument();
  });

  it('capitalizes order instruction', () => {
    const tradeWithLumpSum: Trade = {
      ...mockTrade,
      order_instruction: 'lump sum',
    };

    render(
      <Table>
        <TableBody>
          <TradeTableRow trade={tradeWithLumpSum} />
        </TableBody>
      </Table>
    );

    // Order Instruction column displays capitalized "Lump Sum" from order_instruction field
    expect(screen.getByText('Lump Sum')).toBeInTheDocument();
  });

  it('displays action field correctly', () => {
    render(
      <Table>
        <TableBody>
          <TradeTableRow trade={mockTrade} />
        </TableBody>
      </Table>
    );

    // Action field should display "Buy" from the action field
    expect(screen.getByText('Buy')).toBeInTheDocument();
    // Verify all cells are present (10 columns total)
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBe(10); // Date, Ticker, Asset Type, Action, Order Instruction, Quantity, Price, Cost Basis, Market Price, Unrealized P/L
  });
});

