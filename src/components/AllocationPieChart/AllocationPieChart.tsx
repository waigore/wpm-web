import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { AllocationPosition } from '../../api/client';
import { formatCurrency, formatPercentage, formatQuantity } from '../../utils/formatters';

export interface AllocationPieChartProps {
  assets: AllocationPosition[];
}

interface InnerRingData {
  name: string;
  value: number;
  percentage: number;
  assetCount: number;
  color: string;
}

interface OuterRingData {
  name: string;
  value: number;
  percentage: number;
  assetType: string;
  asset: AllocationPosition;
  color: string;
}

// Color palette for asset types (inner ring)
const ASSET_TYPE_COLORS: Record<string, string> = {
  Stock: '#1976d2', // Blue
  ETF: '#2e7d32', // Green
  Crypto: '#ed6c02', // Orange
  Bond: '#9c27b0', // Purple
  Commodity: '#d32f2f', // Red
  Other: '#616161', // Gray
};

// Generate color variations for outer ring (lighter/darker shades)
function getColorVariation(baseColor: string, index: number, total: number): string {
  // Convert hex to RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Create variation based on index
  const factor = 0.7 + (index / total) * 0.3; // Range from 0.7 to 1.0
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));

  return `rgb(${newR}, ${newG}, ${newB})`;
}

// Custom label component for inner ring with dark contrasting color
const InnerRingLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333333" // Dark color for contrast
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
      fontWeight={600}
    >
      {`${name} (${formatPercentage(percentage)})`}
    </text>
  );
};

// Unified custom tooltip that handles both inner and outer rings
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  // Check if this is outer ring data (has asset property)
  if ('asset' in data) {
    const outerData: OuterRingData = data;
    const asset = outerData.asset;
    const metadata = asset.metadata || {};

    return (
      <Paper elevation={3} sx={{ p: 2, maxWidth: 300 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {asset.ticker}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {asset.asset_type}
          {metadata.sector && ` • ${metadata.sector}`}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2">
            <strong>Market Value:</strong> {formatCurrency(asset.market_value)}
          </Typography>
          <Typography variant="body2">
            <strong>Allocation:</strong> {formatPercentage(asset.allocation_percentage)}
          </Typography>
          <Typography variant="body2">
            <strong>Cost Basis:</strong> {formatCurrency(asset.cost_basis)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                asset.unrealized_gain_loss === null || asset.unrealized_gain_loss === undefined
                  ? 'text.primary'
                  : asset.unrealized_gain_loss >= 0
                    ? 'success.main'
                    : 'error.main',
            }}
          >
            <strong>Unrealized P/L:</strong> {formatCurrency(asset.unrealized_gain_loss ?? null)}
          </Typography>
          <Typography variant="body2">
            <strong>Current Price:</strong> {formatCurrency(asset.current_price)}
          </Typography>
          <Typography variant="body2">
            <strong>Quantity:</strong> {formatQuantity(asset.quantity)} shares
          </Typography>
          <Typography variant="body2">
            <strong>Average Price:</strong> {formatCurrency(asset.average_price)}
          </Typography>
          {metadata.industry && (
            <Typography variant="body2" color="text.secondary">
              <strong>Industry:</strong> {metadata.industry}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  // Inner ring data (asset types)
  const innerData: InnerRingData = data;
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
        {innerData.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Market Value: {formatCurrency(innerData.value)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Allocation: {formatPercentage(innerData.percentage)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Assets: {innerData.assetCount}
      </Typography>
    </Paper>
  );
};

export const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ assets }) => {
  const { innerRingData, outerRingData } = useMemo(() => {
    if (!assets || assets.length === 0) {
      return { innerRingData: [], outerRingData: [] };
    }

    // Calculate total market value for percentage calculations
    const totalMarketValue = assets.reduce((sum, asset) => {
      return sum + (asset.market_value ?? 0);
    }, 0);

    // Group assets by asset type for inner ring
    const assetsByType = new Map<string, AllocationPosition[]>();
    assets.forEach((asset) => {
      const type = asset.asset_type;
      if (!assetsByType.has(type)) {
        assetsByType.set(type, []);
      }
      assetsByType.get(type)!.push(asset);
    });

    // Create inner ring data (asset types)
    const innerRing: InnerRingData[] = Array.from(assetsByType.entries()).map(
      ([type, typeAssets]) => {
        const typeValue = typeAssets.reduce((sum, asset) => {
          return sum + (asset.market_value ?? 0);
        }, 0);
        const typePercentage = totalMarketValue > 0 ? (typeValue / totalMarketValue) * 100 : 0;

        return {
          name: type,
          value: typeValue,
          percentage: typePercentage,
          assetCount: typeAssets.length,
          color: ASSET_TYPE_COLORS[type] || ASSET_TYPE_COLORS.Other,
        };
      }
    );

    // Sort inner ring by value (descending)
    innerRing.sort((a, b) => b.value - a.value);

    // Create outer ring data (individual assets)
    // Iterate through innerRing in order (already sorted by value) to ensure alignment
    const outerRing: OuterRingData[] = [];
    innerRing.forEach((innerEntry) => {
      const typeAssets = assetsByType.get(innerEntry.name) || [];
      // Sort assets within this type by value (descending)
      const sortedTypeAssets = [...typeAssets].sort((a, b) => 
        (b.market_value ?? 0) - (a.market_value ?? 0)
      );
      
      sortedTypeAssets.forEach((asset, index) => {
        const assetTypeColor = ASSET_TYPE_COLORS[asset.asset_type] || ASSET_TYPE_COLORS.Other;
        outerRing.push({
          name: asset.ticker,
          value: asset.market_value ?? 0,
          percentage: asset.allocation_percentage ?? 0,
          assetType: asset.asset_type,
          asset,
          color: getColorVariation(assetTypeColor, index, sortedTypeAssets.length),
        });
      });
    });

    return { innerRingData: innerRing, outerRingData: outerRing };
  }, [assets]);

  if (assets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={8}>
        <Typography variant="body1" color="text.secondary">
          No assets to display
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        {/* Inner ring - Asset types */}
        <Pie
          data={innerRingData as any}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius="60%"
          label={InnerRingLabel}
          labelLine={false}
        >
          {innerRingData.map((entry, index) => (
            <Cell key={`inner-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {/* Outer ring - Individual assets */}
        <Pie
          data={outerRingData as any}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius="65%"
          outerRadius="100%"
          label={(entry: any) => {
            // Only show label if percentage is significant (>2%)
            return entry.percentage > 2 ? `${entry.name} (${formatPercentage(entry.percentage)})` : '';
          }}
          labelLine={false}
        >
          {outerRingData.map((entry, index) => (
            <Cell key={`outer-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          wrapperStyle={{ paddingTop: '50px' }}
          payload={innerRingData.map((entry) => ({
            value: `${entry.name} (${formatPercentage(entry.percentage)})`,
            type: 'square' as const,
            color: entry.color,
            id: entry.name,
          })) as any}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
