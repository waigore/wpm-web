import React from 'react';
import { TableRow as MuiTableRow, TableCell, TableRowProps as MuiTableRowProps } from '@mui/material';
import type { Lot } from '../../api/client';
import { formatCurrency, formatQuantity, formatDate } from '../../utils/formatters';
import { getActionColor, getGainLossColor } from '../../utils/colorHelpers';

export interface LotTableRowProps extends Omit<MuiTableRowProps, 'children'> {
  lot: Lot;
}

export const LotTableRow: React.FC<LotTableRowProps> = ({ lot, ...props }) => {
  const hasMatchedSells = lot.matched_sells && lot.matched_sells.length > 0;

  return (
    <>
      <MuiTableRow {...props}>
        <TableCell>{formatDate(lot.date)}</TableCell>
        <TableCell>{lot.ticker}</TableCell>
        <TableCell>{lot.asset_type}</TableCell>
        <TableCell>{lot.broker}</TableCell>
        <TableCell align="right">{formatQuantity(lot.original_quantity)}</TableCell>
        <TableCell align="right">{formatQuantity(lot.remaining_quantity)}</TableCell>
        <TableCell align="right">{formatCurrency(lot.cost_basis)}</TableCell>
        <TableCell
          align="right"
          sx={{
            color: getGainLossColor(lot.realized_pnl),
          }}
        >
          {formatCurrency(lot.realized_pnl)}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: getGainLossColor(lot.unrealized_pnl),
          }}
        >
          {formatCurrency(lot.unrealized_pnl)}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: getGainLossColor(lot.total_pnl),
          }}
        >
          {formatCurrency(lot.total_pnl)}
        </TableCell>
      </MuiTableRow>
      {hasMatchedSells &&
        lot.matched_sells!.map((matchedSell, index) => (
          <MuiTableRow
            key={`matched-sell-${index}`}
            sx={{
              backgroundColor: 'grey.50',
              '& td': {
                paddingLeft: 4,
                fontSize: '0.875rem',
              },
            }}
          >
            <TableCell>{formatDate(matchedSell.trade.date)}</TableCell>
            <TableCell
              sx={{
                color: getActionColor(matchedSell.trade.action),
                fontWeight: 'medium',
              }}
            >
              {matchedSell.trade.action}
            </TableCell>
            <TableCell>—</TableCell>
            <TableCell>{matchedSell.trade.broker}</TableCell>
            <TableCell align="right">{formatQuantity(matchedSell.consumed_quantity)}</TableCell>
            <TableCell align="right">—</TableCell>
            <TableCell align="right">—</TableCell>
            <TableCell align="right">—</TableCell>
            <TableCell align="right">—</TableCell>
            <TableCell align="right">{formatCurrency(matchedSell.trade.price)}</TableCell>
          </MuiTableRow>
        ))}
    </>
  );
};

