import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TableRow as MuiTableRow,
  TableCell,
  TableRowProps as MuiTableRowProps,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Position } from '../../api/client';
import { formatCurrency, formatQuantity, formatNumber } from '../../utils/formatters';
import { getGainLossColor } from '../../utils/colorHelpers';
import type { AssetMetadata } from '../../hooks/useAssetMetadata';

export interface TableRowProps extends Omit<MuiTableRowProps, 'children'> {
  position: Position;
  metadata?: AssetMetadata;
}

export const TableRow: React.FC<TableRowProps> = ({ position, metadata, ...props }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTradesClick = () => {
    handleMenuClose();
    navigate(`/portfolio/trades/${position.ticker}`);
  };

  const handleLotsClick = () => {
    handleMenuClose();
    navigate(`/portfolio/lots/${position.ticker}`);
  };

  const formatMetadataForTooltip = (meta: AssetMetadata): string => {
    if (!meta) {
      return '';
    }

    const fields = [
      { label: 'Name', value: meta.name },
      { label: 'Type', value: meta.type },
      { label: 'Market Cap', value: meta.market_cap },
      { label: 'Sector', value: meta.sector },
      { label: 'Industry', value: meta.industry },
      { label: 'Country', value: meta.country },
      { label: 'Category', value: meta.category ?? 'unknown' },
    ];

    return fields
      .map((field) => {
        const value = field.value ?? 'N/A';
        return `${field.label}: ${value}`;
      })
      .join('\n');
  };

  const truncateName = (name: string | undefined): string => {
    if (!name) {
      return '';
    }
    if (name.length <= 40) {
      return name;
    }
    return name.substring(0, 40) + '...';
  };

  const assetName = metadata?.name ? truncateName(metadata.name) : null;
  const tooltipContent = metadata ? formatMetadataForTooltip(metadata) : null;

  const tickerCellContent = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        minWidth: 0, // Allow flexbox to shrink below content size
      }}
    >
      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {position.ticker}
      </Typography>
      {assetName && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            minWidth: 0, // Allow flexbox to shrink below content size
          }}
        >
          {assetName}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      <MuiTableRow {...props}>
        <TableCell
          sx={{
            width: 200,
            maxWidth: 200,
            paddingRight: 1,
          }}
        >
          {tooltipContent ? (
            <Tooltip title={tooltipContent} arrow placement="right">
              {tickerCellContent}
            </Tooltip>
          ) : (
            tickerCellContent
          )}
        </TableCell>
        <TableCell>{position.asset_type}</TableCell>
        <TableCell align="right">{formatQuantity(position.quantity)}</TableCell>
        <TableCell align="right">{formatCurrency(position.average_price)}</TableCell>
        <TableCell align="right">{formatCurrency(position.cost_basis)}</TableCell>
        <TableCell align="right">{formatCurrency(position.current_price)}</TableCell>
        <TableCell align="right">{formatCurrency(position.market_value)}</TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
            <Typography
              variant="body2"
              sx={{
                color: getGainLossColor(position.unrealized_gain_loss),
                fontWeight: 'medium',
              }}
            >
              {formatCurrency(position.unrealized_gain_loss)} (Unrealized)
            </Typography>
            {position.realized_gain_loss !== null && position.realized_gain_loss !== undefined && position.realized_gain_loss !== 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: getGainLossColor(position.realized_gain_loss),
                  fontWeight: 'medium',
                }}
              >
                {formatCurrency(position.realized_gain_loss)} (Realized)
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell align="right">
          {formatNumber(position.allocation_percentage, 2) + '%'}
        </TableCell>
        <TableCell padding="checkbox" align="right">
          <IconButton
            aria-label={`Actions for ${position.ticker}`}
            aria-controls={open ? `menu-${position.ticker}` : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </TableCell>
      </MuiTableRow>
      <Menu
        id={`menu-${position.ticker}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': `actions-button-${position.ticker}`,
        }}
      >
        <MenuItem onClick={handleTradesClick}>Trades</MenuItem>
        <MenuItem onClick={handleLotsClick}>Lots</MenuItem>
      </Menu>
    </>
  );
};

