import React from 'react';
import { TableRow as MuiTableRow, TableCell, TableRowProps as MuiTableRowProps } from '@mui/material';
import type { Trade } from '../../api/client';
import { formatCurrency, formatQuantity, formatDate } from '../../utils/formatters';

export interface TradeTableRowProps extends Omit<MuiTableRowProps, 'children'> {
  trade: Trade;
}

export const TradeTableRow: React.FC<TradeTableRowProps> = ({ trade, ...props }) => {
  const getProfitLossColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'inherit';
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'inherit';
  };

  const getActionColor = (action: string): string => {
    if (action === 'Buy') return 'success.main';
    if (action === 'Sell') return 'error.main';
    return 'inherit';
  };

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
          color: getProfitLossColor(trade.unrealized_profit_loss),
          fontWeight: 'medium',
        }}
      >
        {formatCurrency(trade.unrealized_profit_loss)}
      </TableCell>
    </MuiTableRow>
  );
};

