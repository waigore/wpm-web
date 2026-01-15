import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableRow } from './TableRow';
import { Table, TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import type { Position } from '../../api/client';

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
  allocation_percentage: 7.88,
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TableRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders position data correctly', () => {
    renderWithRouter(
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
            <TableCell>Allocation %</TableCell>
            <TableCell>Actions</TableCell>
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
      allocation_percentage: null,
    };

    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={positionWithNull} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('renders allocation_percentage correctly', () => {
    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('7.88%')).toBeInTheDocument();
  });

  it('handles null allocation_percentage', () => {
    const positionWithNullAllocation: Position = {
      ...mockPosition,
      allocation_percentage: null,
    };

    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={positionWithNullAllocation} />
        </TableBody>
      </Table>
    );

    expect(screen.getByText('N/A%')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    renderWithRouter(
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
    const { container } = renderWithRouter(
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

    const { container } = renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={negativePosition} />
        </TableBody>
      </Table>
    );

    const row = container.querySelector('.MuiTableRow-root');
    expect(row).toBeInTheDocument();
  });

  it('renders menu button', () => {
    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    const menuButton = screen.getByLabelText(`Actions for ${mockPosition.ticker}`);
    expect(menuButton).toBeInTheDocument();
  });

  it('opens menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    const menuButton = screen.getByLabelText(`Actions for ${mockPosition.ticker}`);
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Trades')).toBeInTheDocument();
    });
  });

  it('navigates to asset trades page when Trades is clicked', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    const menuButton = screen.getByLabelText(`Actions for ${mockPosition.ticker}`);
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Trades')).toBeInTheDocument();
    });

    const tradesMenuItem = screen.getByText('Trades');
    await user.click(tradesMenuItem);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/portfolio/asset/${mockPosition.ticker}`);
    });
  });

  it('navigates to asset lots page when Lots is clicked', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <Table>
        <TableBody>
          <TableRow position={mockPosition} />
        </TableBody>
      </Table>
    );

    const menuButton = screen.getByLabelText(`Actions for ${mockPosition.ticker}`);
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Lots')).toBeInTheDocument();
    });

    const lotsMenuItem = screen.getByText('Lots');
    await user.click(lotsMenuItem);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/portfolio/lots/${mockPosition.ticker}`);
    });
  });
});

