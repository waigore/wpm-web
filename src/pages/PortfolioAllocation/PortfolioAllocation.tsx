import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { AllocationPieChart } from '../../components/AllocationPieChart/AllocationPieChart';
import { AllocationFilters } from '../../components/AllocationFilters/AllocationFilters';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolioAllocation } from '../../hooks/usePortfolioAllocation';
import logger from '../../utils/logger';

export const PortfolioAllocation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [allAvailableAssetTypes, setAllAvailableAssetTypes] = useState<string[]>([]);
  const [allAvailableTickers, setAllAvailableTickers] = useState<string[]>([]);

  // Fetch all options once on mount (no filters) - separate from filtered data
  const { assets: allAssets } = usePortfolioAllocation({});

  // Fetch filtered data for chart display
  const {
    assets,
    loading,
    error,
    refetch,
  } = usePortfolioAllocation({
    asset_types: selectedAssetTypes.length > 0 ? selectedAssetTypes : undefined,
    tickers: selectedTickers.length > 0 ? selectedTickers : undefined,
  });

  // Extract and store all available options (only once)
  useEffect(() => {
    if (allAssets.length > 0 && allAvailableAssetTypes.length === 0) {
      const assetTypesSet = new Set<string>();
      const tickersSet = new Set<string>();
      allAssets.forEach((asset) => {
        assetTypesSet.add(asset.asset_type);
        tickersSet.add(asset.ticker);
      });
      setAllAvailableAssetTypes(Array.from(assetTypesSet).sort());
      setAllAvailableTickers(Array.from(tickersSet).sort());
    }
  }, [allAssets, allAvailableAssetTypes.length]);

  useEffect(() => {
    if (isAuthenticated) {
      logger.info('Portfolio allocation page loaded', { context: 'PortfolioAllocation' });
      logger.debug('PortfolioAllocation component mounted', { context: 'PortfolioAllocation' });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading && !error) {
      logger.debug('PortfolioAllocation component rendered', {
        context: 'PortfolioAllocation',
        assetCount: assets.length,
        selectedAssetTypes,
        selectedTickers,
      });
    }
  }, [loading, error, assets.length, selectedAssetTypes, selectedTickers]);

  const handleAssetTypesChange = (types: string[]) => {
    setSelectedAssetTypes(types);
    logger.info(`Asset type filter changed: ${types.join(', ')}`, {
      context: 'PortfolioAllocation',
    });
  };

  const handleTickersChange = (tickers: string[]) => {
    setSelectedTickers(tickers);
    logger.info(`Ticker filter changed: ${tickers.join(', ')}`, {
      context: 'PortfolioAllocation',
    });
  };

  const handleRetry = async () => {
    logger.info('Retrying portfolio allocation fetch', { context: 'PortfolioAllocation' });
    await refetch();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/portfolio' },
          { label: 'Portfolio', path: '/portfolio' },
          { label: 'Allocation' },
        ]}
      />
      <Box sx={{ mb: 2 }} />
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio Allocation
      </Typography>

      {/* Filters Section */}
      <AllocationFilters
        availableAssetTypes={allAvailableAssetTypes}
        availableTickers={allAvailableTickers}
        selectedAssetTypes={selectedAssetTypes}
        selectedTickers={selectedTickers}
        onAssetTypesChange={handleAssetTypesChange}
        onTickersChange={handleTickersChange}
      />

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress aria-label="Loading allocation data" aria-live="polite" />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </Box>
      )}

      {/* Chart */}
      {!loading && !error && (
        <Paper elevation={2} sx={{ p: 3 }}>
          {assets.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
              <Typography variant="body1" color="text.secondary">
                No assets match the selected filters. Try adjusting your filters.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                Portfolio Allocation
              </Typography>
              <Box sx={{ mt: 2, mb: 3 }}>
                <AllocationPieChart assets={assets} />
              </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
};
