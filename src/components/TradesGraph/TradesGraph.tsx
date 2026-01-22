import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PricePoint, Trade } from '../../api/client';
import { formatCurrency } from '../../utils/formatters';
import { areAllTradesVisible } from '../../utils/tradeHelpers';

export type TradesGraphGranularity = 'daily' | 'weekly';
export type TradesGraphDateRange = 'ytd' | '1y' | '2y';

export interface TradesGraphProps {
  ticker: string;
  prices: PricePoint[];
  currentPrice: number | null;
  /** @deprecated Use allTrades instead */
  trades?: Trade[];
  /** All trades for the asset (for displaying all markers) */
  allTrades?: Trade[];
  /** Trades currently visible in the table (for sync logic) */
  visibleTrades?: Trade[];
  granularity: TradesGraphGranularity;
  dateRange: TradesGraphDateRange;
  onGranularityChange: (granularity: TradesGraphGranularity) => void;
  onDateRangeChange: (dateRange: TradesGraphDateRange) => void;
}

interface ChartPoint {
  date: string;
  price: number;
  trades: Trade[];
}

function groupByWeek(points: PricePoint[]): ChartPoint[] {
  const buckets = new Map<string, { date: string; price: number }>();

  points.forEach((p) => {
    const d = new Date(p.date);
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7; // Monday-based weeks
    const monday = new Date(d);
    monday.setDate(d.getDate() - diffToMonday);
    const key = monday.toISOString().split('T')[0];
    // always keep the last price in the week
    buckets.set(key, { date: p.date, price: p.price });
  });

  const result: ChartPoint[] = [];
  buckets.forEach((value, key) => {
    result.push({
      date: key,
      price: value.price,
      trades: [],
    });
  });

  // sort by date ascending
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return result;
}

function attachTradesToPoints(points: ChartPoint[], trades: Trade[], granularity: TradesGraphGranularity): ChartPoint[] {
  if (points.length === 0 || trades.length === 0) {
    return points;
  }

  const byDate = new Map<string, ChartPoint>();
  points.forEach((p) => {
    byDate.set(p.date, { ...p, trades: [] });
  });

  const result = Array.from(byDate.values());

  if (granularity === 'daily') {
    trades.forEach((t) => {
      const existing = byDate.get(t.date);
      if (existing) {
        existing.trades.push(t);
      }
    });
  } else {
    // weekly: map trades into the week bucket of the chart point
    result.forEach((p) => {
      p.trades = [];
    });
    trades.forEach((t) => {
      const tradeDate = new Date(t.date);
      let closestPoint: ChartPoint | null = null;
      result.forEach((p) => {
        const pointDate = new Date(p.date);
        if (pointDate <= tradeDate) {
          if (!closestPoint || pointDate > new Date(closestPoint.date)) {
            closestPoint = p;
          }
        }
      });
      if (!closestPoint) {
        closestPoint = result[0];
      }
      closestPoint.trades.push(t);
    });
  }

  return result;
}

function formatYAxisTick(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export const TradesGraph: React.FC<TradesGraphProps> = ({
  ticker,
  prices,
  currentPrice,
  trades,
  allTrades,
  visibleTrades = [],
  granularity,
  dateRange,
  onGranularityChange,
  onDateRangeChange,
}) => {
  // Use allTrades if provided, otherwise fall back to trades for backward compatibility
  const tradesForGraph = allTrades ?? trades ?? [];

  const chartData: ChartPoint[] = useMemo(() => {
    if (!prices || prices.length === 0) {
      return [];
    }

    let basePoints: ChartPoint[];
    if (granularity === 'daily') {
      basePoints = prices
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((p) => ({
          date: p.date,
          price: p.price,
          trades: [],
        }));
    } else {
      basePoints = groupByWeek(prices);
    }

    return attachTradesToPoints(basePoints, tradesForGraph, granularity);
  }, [prices, tradesForGraph, granularity]);

  const handleGranularityToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newGranularity: TradesGraphGranularity | null
  ) => {
    if (newGranularity) {
      onGranularityChange(newGranularity);
    }
  };

  const handleDateRangeToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newDateRange: TradesGraphDateRange | null
  ) => {
    if (newDateRange) {
      onDateRangeChange(newDateRange);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    const point: ChartPoint = payload[0].payload;
    const dateLabel = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).format(new Date(point.date));
    const priceLabel = formatCurrency(point.price);

    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {dateLabel}
        </Typography>
        <Typography variant="h6" component="div">
          {priceLabel}
        </Typography>
        {point.trades.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {point.trades.map((t, idx) => (
              <Typography key={idx} variant="body2" color="text.secondary">
                {`${t.action} ${t.quantity} @ ${formatCurrency(t.price)}`}
              </Typography>
            ))}
          </Box>
        )}
      </Paper>
    );
  };

  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    const point: ChartPoint = payload;
    if (!point.trades || point.trades.length === 0) {
      return null;
    }

    // Check if all trades in this marker are visible in the table
    const allVisible = areAllTradesVisible(point.trades, visibleTrades);

    // If not all trades are visible, gray out the marker
    if (!allVisible) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#9e9e9e" stroke="#fff" strokeWidth={1.5} />
          <text x={cx} y={cy + 3} textAnchor="middle" fontSize={10} fill="#fff">
            {point.trades.some((t) => t.action === 'Buy') ? 'B' : point.trades.some((t) => t.action === 'Sell') ? 'S' : ''}
          </text>
        </g>
      );
    }

    // All trades are visible - use existing color logic
    const hasBuy = point.trades.some((t) => t.action === 'Buy');
    const hasSell = point.trades.some((t) => t.action === 'Sell');

    let fill = '#1976d2';
    let label = '';

    if (hasBuy) {
      const anyBuy = point.trades.find((t) => t.action === 'Buy');
      if (anyBuy && currentPrice != null) {
        if (anyBuy.price < currentPrice) {
          fill = '#2e7d32'; // green
        } else if (anyBuy.price > currentPrice) {
          fill = '#d32f2f'; // red
        }
      }
      label = 'B';
    } else if (hasSell) {
      fill = '#0288d1';
      label = 'S';
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#fff" strokeWidth={1.5} />
        {label && (
          <text x={cx} y={cy + 3} textAnchor="middle" fontSize={10} fill="#fff">
            {label}
          </text>
        )}
      </g>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 3, gap: 2 }}>
        <Typography variant="h6" component="h2">
          {ticker}: Trades Graph
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Granularity
            </Typography>
            <ToggleButtonGroup
              value={granularity}
              exclusive
              onChange={handleGranularityToggle}
              aria-label="select granularity"
              size="small"
            >
              <ToggleButton value="daily" aria-label="daily">
                Daily
              </ToggleButton>
              <ToggleButton value="weekly" aria-label="weekly">
                Weekly
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
              onChange={handleDateRangeToggle}
              aria-label="select date range"
              size="small"
            >
              <ToggleButton value="ytd" aria-label="year to date">
                YTD
              </ToggleButton>
              <ToggleButton value="1y" aria-label="1 year">
                1y
              </ToggleButton>
              <ToggleButton value="2y" aria-label="2 years">
                2y
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {chartData.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={8}>
          <Typography variant="body1" color="text.secondary">
            No price data available for the selected date range
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) =>
                new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                }).format(new Date(value))
              }
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={formatYAxisTick}
              label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {currentPrice != null && (
              <ReferenceLine
                y={currentPrice}
                stroke="#9e9e9e"
                strokeDasharray="4 4"
                label={{
                  value: 'Current price',
                  position: 'right',
                  fill: '#616161',
                  fontSize: 12,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1976d2"
              strokeWidth={2}
              dot={renderDot}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

