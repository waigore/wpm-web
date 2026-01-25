import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { AllocationPosition } from '../../api/client';
import { formatCurrency, formatPercentage, formatQuantity } from '../../utils/formatters';

export interface AllocationTreemapProps {
  assets: AllocationPosition[];
}

interface TreemapNode {
  name: string;
  value: number;
  percentage?: number;
  children?: TreemapNode[];
  asset?: AllocationPosition; // For leaf nodes
  assetType?: string; // For parent nodes
  assetCount?: number; // For parent nodes
  color?: string;
  fill?: string; // For recharts compatibility
  [key: string]: any; // Index signature for recharts compatibility
}

// Color palette for asset types (same as pie chart)
const ASSET_TYPE_COLORS: Record<string, string> = {
  Stock: '#1976d2', // Blue
  ETF: '#2e7d32', // Green
  Crypto: '#ed6c02', // Orange
  Bond: '#9c27b0', // Purple
  Commodity: '#d32f2f', // Red
  Other: '#616161', // Gray
};

// Custom tooltip for treemap
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Recharts Treemap passes data directly in payload[0], not in payload[0].payload
  const data = payload[0].payload || payload[0];

  // Check if this is a leaf node (has asset property)
  if ('asset' in data && data.asset) {
    const asset: AllocationPosition = data.asset;
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

  // Parent node data (asset types)
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
        {data.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Market Value: {formatCurrency(data.value)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Allocation: {formatPercentage(data.percentage)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Assets: {data.assetCount}
      </Typography>
    </Paper>
  );
};

// Custom content renderer for treemap cells
const CustomContent = (props: any) => {
  // Recharts Treemap passes data directly as props, not as payload
  const { x, y, width, height, name, children, asset, percentage, fill } = props;
  
  // Guard against undefined or invalid props
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    return null;
  }
  
  // Check if this is a leaf node (no children or empty children array)
  const isLeaf = !children || (Array.isArray(children) && children.length === 0);

  // Get the fill color for this cell
  const cellFill = fill || (asset?.asset_type ? ASSET_TYPE_COLORS[asset.asset_type] : ASSET_TYPE_COLORS.Other) || '#616161';

  // Render the cell rectangle - this is required for the cell to be visible
  // For parent nodes, render a rectangle with the fill color
  // For leaf nodes, render both the rectangle and the label
  if (!isLeaf) {
    // Parent node - just render the rectangle
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={cellFill}
          stroke="#fff"
          strokeWidth={2}
        />
      </g>
    );
  }

  // If no asset and no name, don't render
  if (!asset && !name) {
    return null;
  }

  const assetPercentage = percentage ?? 0;

  // Determine text color based on background color brightness
  const getTextColor = (bgColor: string): string => {
    // For darker colors, use white text; for lighter colors, use dark text
    if (bgColor === '#1976d2' || bgColor === '#2e7d32' || bgColor === '#9c27b0' || bgColor === '#d32f2f') {
      return '#ffffff';
    }
    if (bgColor === '#ed6c02') {
      return '#ffffff';
    }
    return '#333333';
  };

  const textColor = getTextColor(cellFill);
  const fontSize = Math.min(Math.max(width / 10, 10), Math.max(height / 6, 10), 14);
  const minSize = Math.min(width, height);

  // Only show labels if cell is large enough
  if (minSize < 40) {
    // Still render the rectangle even if label is too small
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={cellFill}
          stroke="#fff"
          strokeWidth={1}
        />
      </g>
    );
  }

  // Leaf node - render rectangle and label
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={cellFill}
        stroke="#fff"
        strokeWidth={1}
      />
      <foreignObject x={x} y={y} width={width} height={height}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px',
            boxSizing: 'border-box',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
          >
            {asset?.ticker || name || ''}
          </Typography>
          {assetPercentage > 2 && minSize > 60 && (
            <Typography
              variant="caption"
              sx={{
                color: textColor,
                fontSize: `${Math.max(fontSize * 0.7, 10)}px`,
                textAlign: 'center',
                opacity: 0.9,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {formatPercentage(assetPercentage)}
            </Typography>
          )}
        </Box>
      </foreignObject>
    </g>
  );
};

export const AllocationTreemap: React.FC<AllocationTreemapProps> = ({ assets }) => {
  const treemapData = useMemo(() => {
    if (!assets || assets.length === 0) {
      return [];
    }

    // Calculate total market value for percentage calculations
    const totalMarketValue = assets.reduce((sum, asset) => {
      return sum + (asset.market_value ?? 0);
    }, 0);

    // Group assets by asset type
    const assetsByType = new Map<string, AllocationPosition[]>();
    assets.forEach((asset) => {
      const type = asset.asset_type;
      if (!assetsByType.has(type)) {
        assetsByType.set(type, []);
      }
      assetsByType.get(type)!.push(asset);
    });

    // Create hierarchical structure
    const treemapNodes: TreemapNode[] = Array.from(assetsByType.entries())
      .map(([type, typeAssets]) => {
        // Calculate type total value
        const typeValue = typeAssets.reduce((sum, asset) => {
          return sum + (asset.market_value ?? 0);
        }, 0);
        const typePercentage = totalMarketValue > 0 ? (typeValue / totalMarketValue) * 100 : 0;

        // Sort assets within type by value (descending)
        const sortedAssets = [...typeAssets].sort(
          (a, b) => (b.market_value ?? 0) - (a.market_value ?? 0)
        );

        // Create children nodes for individual assets
        const children: TreemapNode[] = sortedAssets.map((asset) => ({
          name: asset.ticker,
          value: asset.market_value ?? 0,
          percentage: asset.allocation_percentage ?? 0,
          asset,
          assetType: type,
          color: ASSET_TYPE_COLORS[type] || ASSET_TYPE_COLORS.Other,
        }));

        return {
          name: type,
          value: typeValue,
          percentage: typePercentage,
          assetType: type,
          assetCount: typeAssets.length,
          children,
          color: ASSET_TYPE_COLORS[type] || ASSET_TYPE_COLORS.Other,
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return treemapNodes;
  }, [assets]);

  // Assign colors to all nodes in the tree and set fill property
  const assignColorsToNodes = (nodes: TreemapNode[]): TreemapNode[] => {
    return nodes.map((node) => {
      const color = node.color || ASSET_TYPE_COLORS[node.assetType || 'Other'] || ASSET_TYPE_COLORS.Other;
      const coloredNode = {
        ...node,
        color,
        fill: color, // Set fill property for recharts
      };
      if (coloredNode.children) {
        coloredNode.children = coloredNode.children.map((child) => ({
          ...child,
          color,
          fill: color, // Set fill property for recharts
        }));
      }
      return coloredNode;
    });
  };

  const coloredTreemapData = useMemo(() => assignColorsToNodes(treemapData), [treemapData]);

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
      <Treemap
        data={coloredTreemapData}
        dataKey="value"
        stroke="#fff"
        content={<CustomContent />}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
};
