import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllocationFilters } from './AllocationFilters';

describe('AllocationFilters', () => {
  const defaultProps = {
    availableAssetTypes: ['Stock', 'ETF', 'Crypto'],
    availableTickers: ['AAPL', 'MSFT', 'GOOGL'],
    selectedAssetTypes: [],
    selectedTickers: [],
    onAssetTypesChange: vi.fn(),
    onTickersChange: vi.fn(),
  };

  it('renders asset type and ticker filters', () => {
    render(<AllocationFilters {...defaultProps} />);

    expect(screen.getByText('Asset Types')).toBeInTheDocument();
    expect(screen.getByText('Tickers')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by asset types')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by ticker symbols')).toBeInTheDocument();
  });

  it('displays selected asset types', () => {
    render(
      <AllocationFilters
        {...defaultProps}
        selectedAssetTypes={['Stock', 'ETF']}
      />
    );

    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('ETF')).toBeInTheDocument();
  });

  it('displays selected tickers', () => {
    render(
      <AllocationFilters
        {...defaultProps}
        selectedTickers={['AAPL', 'MSFT']}
      />
    );

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
  });

  it('calls onAssetTypesChange when asset type is selected', async () => {
    const onAssetTypesChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AllocationFilters
        {...defaultProps}
        onAssetTypesChange={onAssetTypesChange}
      />
    );

    const assetTypeInput = screen.getByLabelText('Filter by asset types');
    await user.click(assetTypeInput);
    await user.type(assetTypeInput, 'Stock');

    // Wait for Autocomplete options to appear
    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'Stock' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const stockOption = screen.getByRole('option', { name: 'Stock' });
    await user.click(stockOption);

    expect(onAssetTypesChange).toHaveBeenCalledWith(['Stock']);
  });

  it('calls onTickersChange when ticker is selected', async () => {
    const onTickersChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AllocationFilters
        {...defaultProps}
        onTickersChange={onTickersChange}
      />
    );

    const tickerInput = screen.getByLabelText('Filter by ticker symbols');
    await user.click(tickerInput);
    await user.type(tickerInput, 'AAPL');

    // Wait for Autocomplete options to appear
    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'AAPL' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const aaplOption = screen.getByRole('option', { name: 'AAPL' });
    await user.click(aaplOption);

    expect(onTickersChange).toHaveBeenCalledWith(['AAPL']);
  });

  it('allows multiple tickers to be selected simultaneously', async () => {
    const onTickersChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AllocationFilters
        {...defaultProps}
        selectedTickers={['AAPL']}
        onTickersChange={onTickersChange}
      />
    );

    // Verify AAPL is already selected
    expect(screen.getByText('AAPL')).toBeInTheDocument();

    // Open ticker input to select another ticker
    const tickerInput = screen.getByLabelText('Filter by ticker symbols');
    await user.click(tickerInput);
    await user.type(tickerInput, 'MSFT');

    // MSFT should still be available even though AAPL is selected
    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'MSFT' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const msftOption = screen.getByRole('option', { name: 'MSFT' });
    await user.click(msftOption);

    // Should be called with both AAPL and MSFT
    expect(onTickersChange).toHaveBeenCalledWith(['AAPL', 'MSFT']);
  });

  it('keeps all options available after selections are made', async () => {
    const user = userEvent.setup();

    render(
      <AllocationFilters
        {...defaultProps}
        selectedTickers={['AAPL', 'MSFT']}
        selectedAssetTypes={['Stock']}
      />
    );

    // Verify selections are displayed
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();

    // Open ticker input - all options should still be available
    const tickerInput = screen.getByLabelText('Filter by ticker symbols');
    await user.click(tickerInput);
    await user.type(tickerInput, 'GOOGL');

    // GOOGL should be available even though AAPL and MSFT are selected
    await waitFor(
      () => {
        expect(screen.getByRole('option', { name: 'GOOGL' })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
