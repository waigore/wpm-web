import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TableHeader } from './TableHeader';
import { TableHead, TableRow as MuiTableRow } from '@mui/material';

describe('TableHeader', () => {
  it('renders non-sortable header', () => {
    render(
      <table>
        <TableHead>
          <MuiTableRow>
            <TableHeader>Column Name</TableHeader>
          </MuiTableRow>
        </TableHead>
      </table>
    );
    expect(screen.getByText('Column Name')).toBeInTheDocument();
  });

  it('renders sortable header', () => {
    const onSort = vi.fn();
    render(
      <table>
        <TableHead>
          <MuiTableRow>
            <TableHeader sortable onSort={onSort}>
              Sortable Column
            </TableHeader>
          </MuiTableRow>
        </TableHead>
      </table>
    );
    expect(screen.getByText('Sortable Column')).toBeInTheDocument();
  });

  it('calls onSort when clicked', async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    render(
      <table>
        <TableHead>
          <MuiTableRow>
            <TableHeader sortable onSort={onSort}>
              Sortable Column
            </TableHeader>
          </MuiTableRow>
        </TableHead>
      </table>
    );
    
    const header = screen.getByText('Sortable Column');
    await user.click(header);
    
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('shows active sort direction', () => {
    render(
      <table>
        <TableHead>
          <MuiTableRow>
            <TableHeader sortable active sortDirection="asc" onSort={() => {}}>
              Sortable Column
            </TableHeader>
          </MuiTableRow>
        </TableHead>
      </table>
    );
    const header = screen.getByText('Sortable Column');
    expect(header).toBeInTheDocument();
  });
});

