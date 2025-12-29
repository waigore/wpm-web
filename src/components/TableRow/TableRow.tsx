import React from 'react';
import { TableRow as MuiTableRow, TableCell, TableRowProps as MuiTableRowProps } from '@mui/material';
import type { Position } from '../../api/client';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

export interface TableRowProps extends Omit<MuiTableRowProps, 'children'> {
  position: Position;
}

export const TableRow: React.FC<TableRowProps> = ({ position, ...props }) => {
  const getGainLossColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'inherit';
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'inherit';
  };

  return (
    <MuiTableRow {...props}>
      <TableCell>{position.ticker}</TableCell>
      <TableCell>{position.asset_type}</TableCell>
      <TableCell align="right">{formatQuantity(position.quantity)}</TableCell>
      <TableCell align="right">{formatCurrency(position.average_price)}</TableCell>
      <TableCell align="right">{formatCurrency(position.cost_basis)}</TableCell>
      <TableCell align="right">{formatCurrency(position.current_price)}</TableCell>
      <TableCell align="right">{formatCurrency(position.market_value)}</TableCell>
      <TableCell
        align="right"
        sx={{
          color: getGainLossColor(position.unrealized_gain_loss),
          fontWeight: 'medium',
        }}
      >
        {formatCurrency(position.unrealized_gain_loss)}
      </TableCell>
    </MuiTableRow>
  );
};

