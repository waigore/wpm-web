import React from 'react';
import { TableRow as MuiTableRow, TableCell, TableRowProps as MuiTableRowProps } from '@mui/material';
import type { Trade } from '../../api/client';
import { formatCurrency, formatQuantity, formatDate } from '../../utils/formatters';
import { getGainLossColor, getActionColor } from '../../utils/colorHelpers';

export interface TradeTableRowProps extends Omit<MuiTableRowProps, 'children'> {
  trade: Trade;
}

export const TradeTableRow: React.FC<TradeTableRowProps> = ({ trade, ...props }) => {
  const capitalizeFirst = (str: string): string => {
    // Handle multi-word strings like "lump sum" by capitalizing each word
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <MuiTableRow {...props}>
      <TableCell>{formatDate(trade.date)}</TableCell>
      <TableCell>{trade.ticker}</TableCell>
      <TableCell>{trade.asset_type}</TableCell>
      <TableCell
        sx={{
          color: getActionColor(trade.action),
          fontWeight: 'medium',
        }}
      >
        {trade.action}
      </TableCell>
      <TableCell>
        {capitalizeFirst(trade.order_instruction)}
      </TableCell>
      <TableCell align="right">{formatQuantity(trade.quantity)}</TableCell>
      <TableCell align="right">{formatCurrency(trade.price)}</TableCell>
      <TableCell align="right">{formatCurrency(trade.cost_basis)}</TableCell>
      <TableCell align="right">{formatCurrency(trade.market_price)}</TableCell>
      <TableCell
        align="right"
        sx={{
          color: getGainLossColor(trade.unrealized_profit_loss),
          fontWeight: 'medium',
        }}
      >
        {formatCurrency(trade.unrealized_profit_loss)}
      </TableCell>
    </MuiTableRow>
  );
};

