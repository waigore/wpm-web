import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TableHead,
  TableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Table as TableComponent } from '../../components/Table/Table';
import { TableHeader } from '../../components/TableHeader/TableHeader';
import { TradeTableRow } from '../../components/TradeTableRow/TradeTableRow';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { useAssetTrades } from '../../hooks/useAssetTrades';
import logger from '../../utils/logger';

type SortByField = 'date' | 'ticker' | 'asset_type' | 'action' | 'order_instruction' | 'quantity' | 'price' | 'cost_basis' | 'market_price' | 'unrealized_profit_loss';
type SortOrder = 'asc' | 'desc';

export const AssetTrades: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<SortByField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      logger.info('Redirecting to login - not authenticated', { context: 'AssetTrades' });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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

  const handleSort = (column: SortByField) => {
    const newSortOrder: SortOrder =
      sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page on sort
    logger.info(`Sorting trades by ${column} ${newSortOrder}`, { context: 'AssetTrades' });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    logger.info(`Navigated to page ${page}`, { context: 'AssetTrades' });
  };

  const handlePageSizeChange = (event: any) => {
    const newSize = event.target.value as number;
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page on size change
    logger.info(`Page size changed to ${newSize}`, { context: 'AssetTrades' });
  };

  const handleRetry = async () => {
    logger.info('Retrying asset trades fetch', { context: 'AssetTrades' });
    await refetch();
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

  if (!isAuthenticated || !ticker) {
    return null;
  }

  const getSortDirection = (column: SortByField): 'asc' | 'desc' | false => {
    if (sortBy === column) {
      return sortOrder;
    }
    return false;
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {ticker}: Trades
      </Typography>

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
                <TableHeader
                  sortable
                  active={sortBy === 'cost_basis'}
                  sortDirection={getSortDirection('cost_basis')}
                  onSort={() => handleSort('cost_basis')}
                  align="right"
                  aria-sort={sortBy === 'cost_basis' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Cost Basis
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'market_price'}
                  sortDirection={getSortDirection('market_price')}
                  onSort={() => handleSort('market_price')}
                  align="right"
                  aria-sort={sortBy === 'market_price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Market Price
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'unrealized_profit_loss'}
                  sortDirection={getSortDirection('unrealized_profit_loss')}
                  onSort={() => handleSort('unrealized_profit_loss')}
                  align="right"
                  aria-sort={sortBy === 'unrealized_profit_loss' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Unrealized P/L
                </TableHeader>
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {trades.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={10} align="center" sx={{ py: 4 }}>
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2">
              Showing {startItem}-{endItem} of {totalItems} trades
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={pageSize}
                  label="Page Size"
                  onChange={handlePageSizeChange}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                disabled={loading}
              />
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
};

