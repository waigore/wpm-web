import React from 'react';
import { TableCell, TableSortLabel, SxProps, Theme } from '@mui/material';

export type SortDirection = 'asc' | 'desc' | false;

export interface TableHeaderProps {
  children: React.ReactNode;
  sortable?: boolean;
  sortDirection?: SortDirection;
  active?: boolean;
  onSort?: () => void;
  align?: 'left' | 'right' | 'center';
  sx?: SxProps<Theme>;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  sortable = false,
  sortDirection = false,
  active = false,
  onSort,
  align = 'left',
  sx,
}) => {
  if (sortable && onSort) {
    return (
      <TableCell align={align} sx={sx}>
        <TableSortLabel
          active={active}
          direction={sortDirection || undefined}
          onClick={onSort}
        >
          {children}
        </TableSortLabel>
      </TableCell>
    );
  }

  return <TableCell align={align} sx={sx}>{children}</TableCell>;
};

