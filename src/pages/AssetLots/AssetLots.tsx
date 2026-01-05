import React, { useState, useEffect } from 'react';
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
import { LotTableRow } from '../../components/LotTableRow/LotTableRow';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { PaginationControls } from '../../components/PaginationControls/PaginationControls';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { useAssetLots } from '../../hooks/useAssetLots';
import { useTableSort } from '../../hooks/useTableSort';
import logger from '../../utils/logger';

type SortByField = 'date' | 'ticker' | 'asset_type' | 'original_quantity' | 'remaining_quantity' | 'cost_basis';

export const AssetLots: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const { isAuthenticated } = useAuth();
  const { sortBy, sortOrder, handleSort: handleSortChange, getSortDirection } = useTableSort<SortByField>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (isAuthenticated && ticker) {
      logger.info(`Asset lots page loaded for ticker: ${ticker}`, { context: 'AssetLots' });
      logger.debug('AssetLots component mounted', { context: 'AssetLots', ticker });
    }
  }, [isAuthenticated, ticker]);

  const {
    lots,
    totalItems,
    totalPages,
    loading,
    error,
    refetch,
  } = useAssetLots(ticker || '', {
    page: currentPage,
    size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const handleSort = (column: SortByField) => {
    handleSortChange(column);
    setCurrentPage(1); // Reset to first page on sort
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    logger.info(`Sorting lots by ${column} ${newSortOrder}`, { context: 'AssetLots' });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    logger.info(`Navigated to page ${page}`, { context: 'AssetLots' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page on size change
    logger.info(`Page size changed to ${newSize}`, { context: 'AssetLots' });
  };

  const handleRetry = async () => {
    logger.info('Retrying asset lots fetch', { context: 'AssetLots' });
    await refetch();
  };

  useEffect(() => {
    if (!loading && !error) {
      logger.debug('AssetLots component rendered', {
        context: 'AssetLots',
        lotsCount: lots.length,
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
        {ticker}: Lots
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress aria-label="Loading lot data" aria-live="polite" />
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </Box>
      )}

      {!loading && !error && (
        <>
          <TableComponent aria-label="Asset lots table">
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
                  active={sortBy === 'original_quantity'}
                  sortDirection={getSortDirection('original_quantity')}
                  onSort={() => handleSort('original_quantity')}
                  align="right"
                  aria-sort={sortBy === 'original_quantity' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Original Quantity
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'remaining_quantity'}
                  sortDirection={getSortDirection('remaining_quantity')}
                  onSort={() => handleSort('remaining_quantity')}
                  align="right"
                  aria-sort={sortBy === 'remaining_quantity' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Remaining Quantity
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
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {lots.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No lots found for this asset
                  </MuiTableCell>
                </MuiTableRow>
              ) : (
                lots.map((lot, index) => (
                  <LotTableRow key={`${lot.date}-${lot.ticker}-${index}`} lot={lot} />
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
            itemLabel="lots"
          />
        </>
      )}
    </Container>
  );
};


