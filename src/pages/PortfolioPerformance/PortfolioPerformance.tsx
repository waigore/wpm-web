import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolioPerformance } from '../../hooks/usePortfolioPerformance';
import { useReferencePerformance } from '../../hooks/useReferencePerformance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import logger from '../../utils/logger';

type Granularity = 'daily' | 'weekly' | 'monthly';
type DateRange = 'portfolio_start' | 'ytd' | '52w';

export const PortfolioPerformance: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [granularity, setGranularity] = useState<Granularity>('weekly');
  const [dateRange, setDateRange] = useState<DateRange>('portfolio_start');

  // Calculate start_date based on dateRange
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let calculatedStartDate: string | null = null;

    if (dateRange === 'ytd') {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      calculatedStartDate = yearStart.toISOString().split('T')[0];
    } else if (dateRange === '52w') {
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      calculatedStartDate = oneYearAgo.toISOString().split('T')[0];
    }
    // For 'portfolio_start', startDate remains null (API will use default)

    return {
      startDate: calculatedStartDate,
      endDate: null, // API defaults to today
    };
  }, [dateRange]);

  const performanceParams = useMemo(
    () => ({
      start_date: startDate,
      end_date: endDate,
      granularity,
    }),
    [startDate, endDate, granularity]
  );

  const {
    historyPoints,
    loading,
    error,
    refetch,
  } = usePortfolioPerformance(performanceParams);

  const {
    historyPoints: referenceHistoryPoints,
    error: referenceError,
  } = useReferencePerformance({
    ticker: 'SPY',
    asset_type: 'ETF',
    ...performanceParams,
  });

  const {
    historyPoints: referenceBtcHistoryPoints,
    error: referenceBtcError,
  } = useReferencePerformance({
    ticker: 'BTC-USD',
    asset_type: 'Crypto',
    ...performanceParams,
  });

  useEffect(() => {
    if (isAuthenticated) {
      logger.info('Portfolio performance page loaded', { context: 'PortfolioPerformance' });
      logger.debug('PortfolioPerformance component mounted', { context: 'PortfolioPerformance' });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading && !error) {
      logger.debug('PortfolioPerformance component rendered', {
        context: 'PortfolioPerformance',
        historyPointsCount: historyPoints.length,
        granularity,
        dateRange,
      });
    }
  }, [loading, error, historyPoints.length, granularity, dateRange]);

  const handleGranularityChange = (
    _event: React.MouseEvent<HTMLElement>,
    newGranularity: Granularity | null
  ) => {
    if (newGranularity !== null) {
      setGranularity(newGranularity);
      logger.info(`Granularity changed to ${newGranularity}`, { context: 'PortfolioPerformance' });
    }
  };

  const handleDateRangeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDateRange: DateRange | null
  ) => {
    if (newDateRange !== null) {
      setDateRange(newDateRange);
      logger.info(`Date range changed to ${newDateRange}`, { context: 'PortfolioPerformance' });
    }
  };

  const handleRetry = async () => {
    logger.info('Retrying portfolio performance fetch', { context: 'PortfolioPerformance' });
    await refetch();
  };

  // Merge portfolio and reference series by date for chart
  const chartData = useMemo(() => {
    const byDate = new Map<
      string,
      {
        date: string;
        total_market_value?: number;
        reference_value?: number;
        reference_btc_value?: number;
        formattedDate: string;
        formattedValue: string;
        formattedReferenceValue?: string;
        formattedReferenceBtcValue?: string;
      }
    >();
    for (const point of historyPoints) {
      byDate.set(point.date, {
        date: point.date,
        total_market_value: point.total_market_value,
        formattedDate: formatDate(point.date),
        formattedValue: formatCurrency(point.total_market_value),
      });
    }
    for (const point of referenceHistoryPoints) {
      const existing = byDate.get(point.date);
      const formattedReferenceValue = formatCurrency(point.total_market_value);
      if (existing) {
        existing.reference_value = point.total_market_value;
        existing.formattedReferenceValue = formattedReferenceValue;
      } else {
        byDate.set(point.date, {
          date: point.date,
          reference_value: point.total_market_value,
          formattedDate: formatDate(point.date),
          formattedValue: '',
          formattedReferenceValue,
        });
      }
    }
    for (const point of referenceBtcHistoryPoints) {
      const existing = byDate.get(point.date);
      const formattedReferenceBtcValue = formatCurrency(point.total_market_value);
      if (existing) {
        existing.reference_btc_value = point.total_market_value;
        existing.formattedReferenceBtcValue = formattedReferenceBtcValue;
      } else {
        byDate.set(point.date, {
          date: point.date,
          reference_btc_value: point.total_market_value,
          formattedDate: formatDate(point.date),
          formattedValue: '',
          formattedReferenceBtcValue,
        });
      }
    }
    const dates = Array.from(byDate.keys()).sort();
    return dates.map((d) => byDate.get(d)!);
  }, [historyPoints, referenceHistoryPoints, referenceBtcHistoryPoints]);

  // Identify dates that should show the year (first occurrence of each month)
  const datesWithYear = useMemo(() => {
    const yearDates = new Set<string>();
    let lastMonth: number | null = null;
    let lastYear: number | null = null;

    chartData.forEach((point) => {
      const date = new Date(point.date);
      const month = date.getMonth();
      const year = date.getFullYear();

      // Show year on first tick of chart or when month/year changes
      if (lastMonth === null || lastYear === null || month !== lastMonth || year !== lastYear) {
        yearDates.add(point.date);
        lastMonth = month;
        lastYear = year;
      }
    });

    return yearDates;
  }, [chartData]);

  // Custom tooltip formatter (portfolio and optional reference values)
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        total_market_value?: number;
        reference_value?: number;
        reference_btc_value?: number;
        formattedDate: string;
        formattedValue: string;
        formattedReferenceValue?: string;
        formattedReferenceBtcValue?: string;
      };
    }>;
  }

  const customTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {data.formattedDate}
          </Typography>
          <Typography variant="h6" component="div">
            {data.formattedValue}
          </Typography>
          {data.formattedReferenceValue != null && (
            <Typography variant="body2" color="text.secondary">
              Reference (SPY): {data.formattedReferenceValue}
            </Typography>
          )}
          {data.formattedReferenceBtcValue != null && (
            <Typography variant="body2" color="text.secondary">
              Reference (BTC-USD): {data.formattedReferenceBtcValue}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Format Y-axis tick as currency
  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/portfolio' },
          { label: 'Portfolio', path: '/portfolio' },
          { label: 'Performance' },
        ]}
      />
      <Box sx={{ mb: 2 }} />
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio Performance
      </Typography>

      {/* Control Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Granularity
          </Typography>
          <ToggleButtonGroup
            value={granularity}
            exclusive
            onChange={handleGranularityChange}
            aria-label="select granularity"
            size="small"
          >
            <ToggleButton value="daily" aria-label="daily">
              Daily
            </ToggleButton>
            <ToggleButton value="weekly" aria-label="weekly">
              Weekly
            </ToggleButton>
            <ToggleButton value="monthly" aria-label="monthly">
              Monthly
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Date Range
          </Typography>
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={handleDateRangeChange}
            aria-label="select date range"
            size="small"
          >
            <ToggleButton value="portfolio_start" aria-label="portfolio start">
              Portfolio Start
            </ToggleButton>
            <ToggleButton value="ytd" aria-label="year to date">
              YTD
            </ToggleButton>
            <ToggleButton value="52w" aria-label="52 weeks">
              52w
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress aria-label="Loading performance data" aria-live="polite" />
        </Box>
      )}

      {/* Error State (portfolio only) */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage message={error} onRetry={handleRetry} />
        </Box>
      )}

      {/* Reference (SPY) failure: non-blocking warning */}
      {referenceError && !loading && !error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning" role="status">
            Reference (SPY) comparison could not be loaded. Refresh the page to try again.
          </Alert>
        </Box>
      )}

      {/* Reference (BTC-USD) failure: non-blocking warning */}
      {referenceBtcError && !loading && !error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning" role="status">
            Reference (BTC-USD) comparison could not be loaded. Refresh the page to try again.
          </Alert>
        </Box>
      )}

      {/* Chart */}
      {!loading && !error && (
        <Paper elevation={2} sx={{ p: 3 }}>
          {chartData.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
              <Typography variant="body1" color="text.secondary">
                No performance data available for the selected date range
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const dateString = value as string;

                    // Show year in YY format on first tick of each month
                    if (datesWithYear.has(dateString)) {
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      });
                    }

                    // Otherwise, show month and day only
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  label={{ value: 'Portfolio Value (USD)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_market_value"
                  name="Portfolio"
                  stroke="#1976d2"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="reference_value"
                  name="Reference (SPY)"
                  stroke="#9e9e9e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="reference_btc_value"
                  name="Reference (BTC-USD)"
                  stroke="#ed7d31"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};
