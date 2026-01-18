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
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { Table as TableComponent } from '../../components/Table/Table';
import { TableHeader } from '../../components/TableHeader/TableHeader';
import { LotTableRow } from '../../components/LotTableRow/LotTableRow';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { PaginationControls } from '../../components/PaginationControls/PaginationControls';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { useAuth } from '../../hooks/useAuth';
import { useAssetLots } from '../../hooks/useAssetLots';
import { useAssetBrokers } from '../../hooks/useAssetBrokers';
import { useTableSort } from '../../hooks/useTableSort';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import logger from '../../utils/logger';

type SortByField = 'date' | 'ticker' | 'asset_type' | 'broker' | 'original_quantity' | 'remaining_quantity' | 'cost_basis' | 'realized_pnl' | 'unrealized_pnl' | 'total_pnl';

export const AssetLots: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const { isAuthenticated } = useAuth();
  const { sortBy, sortOrder, handleSort: handleSortChange, getSortDirection } = useTableSort<SortByField>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && ticker) {
      logger.info(`Asset lots page loaded for ticker: ${ticker}`, { context: 'AssetLots' });
      logger.debug('AssetLots component mounted', { context: 'AssetLots', ticker });
    }
  }, [isAuthenticated, ticker]);

  const { brokers: availableBrokers } = useAssetBrokers(ticker || '');

  const brokersParam = useMemo(() => {
    return selectedBrokers.length > 0 ? selectedBrokers.join(',') : undefined;
  }, [selectedBrokers]);

  const {
    lots,
    totalItems,
    totalPages,
    loading,
    error,
    overallPosition,
    perBrokerPositions,
    refetch,
  } = useAssetLots(ticker || '', {
    page: currentPage,
    size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
    brokers: brokersParam,
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

  const handleBrokerChange = (event: any) => {
    const value = event.target.value as string[];
    setSelectedBrokers(value);
    setCurrentPage(1); // Reset to first page on filter change
    logger.info(`Broker filter changed: ${value.join(', ')}`, { context: 'AssetLots' });
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

      {!loading && !error && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2, maxWidth: 400 }}>
            <InputLabel id="broker-filter-label">Broker</InputLabel>
            <Select
              labelId="broker-filter-label"
              id="broker-filter"
              multiple
              value={selectedBrokers}
              onChange={handleBrokerChange}
              label="Broker"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableBrokers.map((broker) => (
                <MenuItem key={broker} value={broker}>
                  {broker}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedBrokers.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Filter:
              </Typography>
              {selectedBrokers.map((broker) => (
                <Chip
                  key={broker}
                  label={`Broker: ${broker}`}
                  size="small"
                  onDelete={() => {
                    const newSelected = selectedBrokers.filter((b) => b !== broker);
                    setSelectedBrokers(newSelected);
                    setCurrentPage(1);
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
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
                  active={sortBy === 'broker'}
                  sortDirection={getSortDirection('broker')}
                  onSort={() => handleSort('broker')}
                  aria-sort={sortBy === 'broker' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Broker
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
                <TableHeader
                  sortable
                  active={sortBy === 'realized_pnl'}
                  sortDirection={getSortDirection('realized_pnl')}
                  onSort={() => handleSort('realized_pnl')}
                  align="right"
                  aria-sort={sortBy === 'realized_pnl' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Realized P/L
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'unrealized_pnl'}
                  sortDirection={getSortDirection('unrealized_pnl')}
                  onSort={() => handleSort('unrealized_pnl')}
                  align="right"
                  aria-sort={sortBy === 'unrealized_pnl' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Unrealized P/L
                </TableHeader>
                <TableHeader
                  sortable
                  active={sortBy === 'total_pnl'}
                  sortDirection={getSortDirection('total_pnl')}
                  onSort={() => handleSort('total_pnl')}
                  align="right"
                  aria-sort={sortBy === 'total_pnl' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Total P/L
                </TableHeader>
              </MuiTableRow>
            </TableHead>
            <TableBody>
              {lots.length === 0 ? (
                <MuiTableRow>
                  <MuiTableCell colSpan={10} align="center" sx={{ py: 4 }}>
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
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Position
              </Typography>
              {overallPosition && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Overall
                    </Typography>
                    <Typography variant="body2">
                      Quantity: {formatQuantity(overallPosition.quantity)}
                    </Typography>
                    <Typography variant="body2">
                      Cost Basis: {formatCurrency(overallPosition.cost_basis)}
                    </Typography>
                  </Box>
                  {perBrokerPositions.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Per Broker
                      </Typography>
                      {perBrokerPositions.map((position) => (
                        <Box key={position.broker} sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {position.broker}
                          </Typography>
                          <Typography variant="body2" sx={{ pl: 2 }}>
                            Quantity: {formatQuantity(position.quantity)}
                          </Typography>
                          <Typography variant="body2" sx={{ pl: 2 }}>
                            Cost Basis: {formatCurrency(position.cost_basis)}
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};


