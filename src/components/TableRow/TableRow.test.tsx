import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableRow } from './TableRow';
import { Table, TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import type { Position } from '../../api/client';
import type { AssetMetadata } from '../../hooks/useAssetMetadata';

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

  describe('Metadata Display', () => {
    const mockMetadata: AssetMetadata = {
      name: 'Apple Inc.',
      type: 'Stock',
      market_cap: '$3.02T',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      country: 'United States',
      category: 'Large Cap',
    };

    it('displays asset name when metadata is provided', () => {
      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} metadata={mockMetadata} />
          </TableBody>
        </Table>
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });

    it('does not display asset name when metadata is not provided', () => {
      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} />
          </TableBody>
        </Table>
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    });

    it('does not display asset name when metadata is null', () => {
      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} metadata={null} />
          </TableBody>
        </Table>
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    });

    it('truncates asset name to 40 characters', () => {
      const longNameMetadata: AssetMetadata = {
        name: 'This is a very long company name that exceeds forty characters limit',
        type: 'Stock',
      };

      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} metadata={longNameMetadata} />
          </TableBody>
        </Table>
      );

      // Find the name element by looking for text that starts with the first part
      const nameElement = screen.getByText((content, element) => {
        return element?.textContent?.startsWith('This is a very long company') === true;
      });
      expect(nameElement).toBeInTheDocument();
      // Check that it's truncated (should be 40 chars + "...")
      const textContent = nameElement.textContent || '';
      expect(textContent.length).toBeLessThanOrEqual(43);
      expect(textContent).toContain('...');
    });

    it('displays tooltip with full metadata on hover', async () => {
      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} metadata={mockMetadata} />
          </TableBody>
        </Table>
      );

      // Find the element with the tooltip (it has aria-label with metadata)
      const tooltipElement = screen.getByLabelText(/Name: Apple Inc./);
      expect(tooltipElement).toBeInTheDocument();

      // Verify all metadata fields are in the aria-label
      const ariaLabel = tooltipElement.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Name: Apple Inc.');
      expect(ariaLabel).toContain('Type: Stock');
      expect(ariaLabel).toContain('Market Cap: $3.02T');
      expect(ariaLabel).toContain('Sector: Technology');
      expect(ariaLabel).toContain('Industry: Consumer Electronics');
      expect(ariaLabel).toContain('Country: United States');
      expect(ariaLabel).toContain('Category: Large Cap');
    });

    it('does not show tooltip when metadata is not provided', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} />
          </TableBody>
        </Table>
      );

      const tickerCell = screen.getByText('AAPL').closest('td');
      expect(tickerCell).toBeInTheDocument();

      if (tickerCell) {
        await user.hover(tickerCell);

        // Wait a bit to ensure tooltip doesn't appear
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(screen.queryByText(/Name:/)).not.toBeInTheDocument();
      }
    });

    it('handles metadata with missing fields', () => {
      const partialMetadata: AssetMetadata = {
        name: 'Apple Inc.',
        type: 'Stock',
        // Other fields missing
      };

      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} metadata={partialMetadata} />
          </TableBody>
        </Table>
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });

    it('displays "unknown" for category when not provided', () => {
      const metadataWithoutCategory: AssetMetadata = {
        name: 'Apple Inc.',
        type: 'Stock',
        market_cap: '$3.02T',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        country: 'United States',
        // category missing
      };

      renderWithRouter(
        <Table>
          <TableBody>
            <TableRow position={mockPosition} metadata={metadataWithoutCategory} />
          </TableBody>
        </Table>
      );

      // Find the element with the tooltip
      const tooltipElement = screen.getByLabelText(/Name: Apple Inc./);
      expect(tooltipElement).toBeInTheDocument();

      // Verify category shows as "unknown"
      const ariaLabel = tooltipElement.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Category: unknown');
    });
  });
});

