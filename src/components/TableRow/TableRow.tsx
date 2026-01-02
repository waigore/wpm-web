import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TableRow as MuiTableRow,
  TableCell,
  TableRowProps as MuiTableRowProps,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Position } from '../../api/client';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { getGainLossColor } from '../../utils/colorHelpers';

export interface TableRowProps extends Omit<MuiTableRowProps, 'children'> {
  position: Position;
}

export const TableRow: React.FC<TableRowProps> = ({ position, ...props }) => {
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
    navigate(`/portfolio/asset/${position.ticker}`);
  };

  return (
    <>
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
      </Menu>
    </>
  );
};

