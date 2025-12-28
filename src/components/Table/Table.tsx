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

export const Table: React.FC<TableProps> = ({ children, ...props }) => {
  return (
    <TableContainer component={Paper}>
      <MuiTable {...props}>{children}</MuiTable>
    </TableContainer>
  );
};

