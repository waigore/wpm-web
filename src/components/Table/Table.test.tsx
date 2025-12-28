import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table } from './Table';
import { TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';

describe('Table', () => {
  it('renders table with children', () => {
    render(
      <Table>
        <TableHead>
          <MuiTableRow>
            <TableCell>Header</TableCell>
          </MuiTableRow>
        </TableHead>
        <TableBody>
          <MuiTableRow>
            <TableCell>Cell</TableCell>
          </MuiTableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Cell')).toBeInTheDocument();
  });

  it('renders with table container and paper', () => {
    const { container } = render(
      <Table>
        <TableHead>
          <MuiTableRow>
            <TableCell>Header</TableCell>
          </MuiTableRow>
        </TableHead>
      </Table>
    );

    // MUI TableContainer creates a div with specific class
    const tableContainer = container.querySelector('.MuiTableContainer-root');
    expect(tableContainer).toBeInTheDocument();
  });
});

