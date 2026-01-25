import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { AllocationPieChart } from '../../components/AllocationPieChart/AllocationPieChart';
import { AllocationTreemap } from '../../components/AllocationTreemap/AllocationTreemap';
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
  const [viewMode, setViewMode] = useState<'pie' | 'treemap'>('pie');

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
        viewMode,
      });
    }
  }, [loading, error, assets.length, selectedAssetTypes, selectedTickers, viewMode]);

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

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: 'pie' | 'treemap' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      logger.info(`View mode changed to ${newViewMode}`, {
        context: 'PortfolioAllocation',
      });
    }
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

      {/* View Toggle Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          View
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="Select visualization view"
          size="small"
        >
          <ToggleButton value="pie" aria-label="Pie chart view">
            Pie Chart
          </ToggleButton>
          <ToggleButton value="treemap" aria-label="Treemap view">
            Treemap
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
                {viewMode === 'pie' ? (
                  <AllocationPieChart assets={assets} />
                ) : (
                  <AllocationTreemap assets={assets} />
                )}
              </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
};
