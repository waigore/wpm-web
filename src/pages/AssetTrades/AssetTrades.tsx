import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TableHead,
  TableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  CircularProgress,
} from '@mui/material';
import { Table as TableComponent } from '../../components/Table/Table';
import { TableHeader } from '../../components/TableHeader/TableHeader';
import { TradeTableRow } from '../../components/TradeTableRow/TradeTableRow';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { PaginationControls } from '../../components/PaginationControls/PaginationControls';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { useAssetTrades } from '../../hooks/useAssetTrades';
import { useTableSort } from '../../hooks/useTableSort';
import { TradesGraph, TradesGraphGranularity, TradesGraphDateRange } from '../../components/TradesGraph/TradesGraph';
import { useAssetPriceHistory } from '../../hooks/useAssetPriceHistory';
import logger from '../../utils/logger';

type SortByField = 'date' | 'ticker' | 'asset_type' | 'action' | 'order_instruction' | 'quantity' | 'price' | 'broker';

export const AssetTrades: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const { isAuthenticated } = useAuth();
  const { sortBy, sortOrder, handleSort: handleSortChange, getSortDirection } = useTableSort<SortByField>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [granularity, setGranularity] = useState<TradesGraphGranularity>('weekly');
  const [dateRange, setDateRange] = useState<TradesGraphDateRange>('ytd');

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let calculatedStartDate: string | null = null;

    if (dateRange === 'ytd') {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      calculatedStartDate = yearStart.toISOString().split('T')[0];
    } else if (dateRange === '1y') {
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      calculatedStartDate = oneYearAgo.toISOString().split('T')[0];
    } else if (dateRange === '2y') {
      const twoYearsAgo = new Date(today);
      twoYearsAgo.setDate(twoYearsAgo.getDate() - 730);
      calculatedStartDate = twoYearsAgo.toISOString().split('T')[0];
    }

    return {
      startDate: calculatedStartDate,
      endDate: null,
    };
  }, [dateRange]);

  useEffect(() => {
    if (isAuthenticated && ticker) {
      logger.info(`Asset trades page loaded for ticker: ${ticker}`, { context: 'AssetTrades' });
      logger.debug('AssetTrades component mounted', { context: 'AssetTrades', ticker });
    }
  }, [isAuthenticated, ticker]);

  const {
    trades,
    totalItems,
    totalPages,
    loading,
    error,
    refetch,
  } = useAssetTrades(ticker || '', {
    page: currentPage,
    size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const {
    prices,
    currentPrice,
    loading: priceLoading,
    error: priceError,
    refetch: refetchPrices,
  } = useAssetPriceHistory(ticker || '', {
    start_date: startDate,
    end_date: endDate,
  });

  const tradesForGraph = useMemo(
    () =>
      trades.filter((trade) => {
        if (startDate && trade.date < startDate) {
          return false;
        }
        // endDate is null (API defaults to today) so no upper bound here
        return true;
      }),
    [trades, startDate]
  );

  const handleSort = (column: SortByField) => {
    handleSortChange(column);
    setCurrentPage(1); // Reset to first page on sort
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    logger.info(`Sorting trades by ${column} ${newSortOrder}`, { context: 'AssetTrades' });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    logger.info(`Navigated to page ${page}`, { context: 'AssetTrades' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page on size change
    logger.info(`Page size changed to ${newSize}`, { context: 'AssetTrades' });
  };

  const handleRetry = async () => {
    logger.info('Retrying asset trades fetch', { context: 'AssetTrades' });
    await refetch();
  };

  const handleRetryPrices = async () => {
    logger.info('Retrying asset price history fetch', { context: 'AssetTrades' });
    await refetchPrices();
  };

  const handleGranularityChange = (newGranularity: TradesGraphGranularity) => {
    setGranularity(newGranularity);
    logger.info(`Trades graph granularity changed to ${newGranularity}`, { context: 'AssetTrades' });
  };

  const handleDateRangeChange = (newDateRange: TradesGraphDateRange) => {
    setDateRange(newDateRange);
    logger.info(`Trades graph date range changed to ${newDateRange}`, { context: 'AssetTrades' });
  };

  useEffect(() => {
    if (!loading && !error) {
      logger.debug('AssetTrades component rendered', {
        context: 'AssetTrades',
        tradesCount: trades.length,
        currentPage,
        sortBy,
        sortOrder,
        ticker,
      });
    }
  });

  if (!ticker) {
    return null;
  }

  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs items={[{ label: 'Home', path: '/portfolio' }, { label: 'Portfolio', path: '/portfolio' }, { label: ticker }]} />
      <Box sx={{ mb: 2 }} />
      <Typography variant="h4" component="h1" gutterBottom>
        {ticker}: Trades
      </Typography>

      {/* Trades Graph section */}
      <Box sx={{ mb: 4 }}>
        {priceLoading && !priceError && (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress aria-label="Loading price data" aria-live="polite" />
          </Box>
        )}

        {priceError && (
          <Box sx={{ mb: 2 }}>
            <ErrorMessage message={priceError} onRetry={handleRetryPrices} />
          </Box>
        )}

        {!priceLoading && !priceError && (
          <TradesGraph
            ticker={ticker}
            prices={prices}
            currentPrice={currentPrice}
            trades={tradesForGraph}
            granularity={granularity}
            dateRange={dateRange}
            onGranularityChange={handleGranularityChange}
            onDateRangeChange={handleDateRangeChange}
          />
        )}
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress aria-label="Loading trade data" aria-live="polite" />
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </Box>
      )}

      {!loading && !error && (
        <>
          <TableComponent aria-label="Asset trades table">
            <TableHead>
              <MuiTableRow>
                <TableHeader
                  sortable
                  active={sortBy === 'date'}
                  sortDirection={getSortDirection('date')}
                  onSort={() => handleSort('date')}
                  aria-sort={sortBy === 'date' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Date
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'ticker'}
                  sortDirection={getSortDirection('ticker')}
                  onSort={() => handleSort('ticker')}
                  aria-sort={sortBy === 'ticker' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Ticker
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'asset_type'}
                  sortDirection={getSortDirection('asset_type')}
                  onSort={() => handleSort('asset_type')}
                  aria-sort={sortBy === 'asset_type' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Asset Type
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'action'}
                  sortDirection={getSortDirection('action')}
                  onSort={() => handleSort('action')}
                  aria-sort={sortBy === 'action' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Action
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'broker'}
                  sortDirection={getSortDirection('broker')}
                  onSort={() => handleSort('broker')}
                  aria-sort={sortBy === 'broker' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Broker
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'order_instruction'}
                  sortDirection={getSortDirection('order_instruction')}
                  onSort={() => handleSort('order_instruction')}
                  aria-sort={sortBy === 'order_instruction' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Order Instruction
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'quantity'}
                  sortDirection={getSortDirection('quantity')}
                  onSort={() => handleSort('quantity')}
                  align="right"
                  aria-sort={sortBy === 'quantity' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Quantity
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'price'}
                  sortDirection={getSortDirection('price')}
                  onSort={() => handleSort('price')}
                  align="right"
                  aria-sort={sortBy === 'price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Price
                </TableHeader>
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {trades.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No trades found for this asset
                  </MuiTableCell>
                </MuiTableRow>
              ) : (
                trades.map((trade, index) => (
                  <TradeTableRow key={`${trade.date}-${trade.ticker}-${index}`} trade={trade} />
                ))
              )}
            </TableBody>
          </TableComponent>

          <PaginationControls
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            itemLabel="trades"
          />
        </>
      )}
    </Container>
  );
};

