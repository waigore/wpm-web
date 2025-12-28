import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Table as TableComponent } from '../../components/Table/Table';
import { TableHeader } from '../../components/TableHeader/TableHeader';
import { TableRow } from '../../components/TableRow/TableRow';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolio } from '../../hooks/usePortfolio';
import logger from '../../utils/logger';

type SortByField = 'ticker' | 'asset_type' | 'quantity' | 'average_price' | 'cost_basis' | 'current_price' | 'market_value' | 'unrealized_gain_loss';
type SortOrder = 'asc' | 'desc';

export const PortfolioOverview: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<SortByField>('ticker');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      logger.info('Redirecting to login - not authenticated', { context: 'PortfolioOverview' });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      logger.info('Portfolio overview page loaded', { context: 'PortfolioOverview' });
      logger.debug('PortfolioOverview component mounted', { context: 'PortfolioOverview' });
    }
  }, [isAuthenticated]);

  const {
    positions,
    totalItems,
    totalPages,
    loading,
    error,
    refetch,
  } = usePortfolio({
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
    logger.info(`Sorting by ${column} ${newSortOrder}`, { context: 'PortfolioOverview' });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    logger.info(`Navigated to page ${page}`, { context: 'PortfolioOverview' });
  };

  const handlePageSizeChange = (event: any) => {
    const newSize = event.target.value as number;
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page on size change
    logger.info(`Page size changed to ${newSize}`, { context: 'PortfolioOverview' });
  };

  const handleRetry = async () => {
    logger.info('Retrying portfolio fetch', { context: 'PortfolioOverview' });
    await refetch();
  };

  useEffect(() => {
    if (!loading && !error) {
      logger.debug('PortfolioOverview component rendered', {
        context: 'PortfolioOverview',
        positionsCount: positions.length,
        currentPage,
        sortBy,
        sortOrder,
      });
    }
  });

  if (!isAuthenticated) {
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
        Portfolio Overview
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress aria-label="Loading portfolio data" aria-live="polite" />
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </Box>
      )}

      {!loading && !error && (
        <>
          <TableComponent aria-label="Portfolio positions table">
            <TableHead>
              <MuiTableRow>
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
                  active={sortBy === 'average_price'}
                  sortDirection={getSortDirection('average_price')}
                  onSort={() => handleSort('average_price')}
                  align="right"
                  aria-sort={sortBy === 'average_price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Average Price
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
                  active={sortBy === 'current_price'}
                  sortDirection={getSortDirection('current_price')}
                  onSort={() => handleSort('current_price')}
                  align="right"
                  aria-sort={sortBy === 'current_price' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Current Price
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'market_value'}
                  sortDirection={getSortDirection('market_value')}
                  onSort={() => handleSort('market_value')}
                  align="right"
                  aria-sort={sortBy === 'market_value' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Market Value
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'unrealized_gain_loss'}
                  sortDirection={getSortDirection('unrealized_gain_loss')}
                  onSort={() => handleSort('unrealized_gain_loss')}
                  align="right"
                  aria-sort={sortBy === 'unrealized_gain_loss' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Unrealized Gain/Loss
                </TableHeader>
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {positions.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No positions found
                  </MuiTableCell>
                </MuiTableRow>
              ) : (
                positions.map((position, index) => (
                  <TableRow key={`${position.ticker}-${index}`} position={position} />
                ))
              )}
            </TableBody>
          </TableComponent>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2">
              Showing {startItem}-{endItem} of {totalItems} positions
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

