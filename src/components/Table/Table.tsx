import React from 'react';
import {
  Table as MuiTable,
  TableContainer,
  Paper,
  TableProps as MuiTableProps,
} from '@mui/material';

export interface TableProps extends MuiTableProps {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, sx, ...props }) => {
  return (
    <TableContainer 
      component={Paper}
      sx={{
        width: '100%',
        overflowX: 'auto',
      }}
    >
      <MuiTable {...props} sx={{ width: '100%', ...sx }}>{children}</MuiTable>
    </TableContainer>
  );
};

