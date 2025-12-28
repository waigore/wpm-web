import type { Meta, StoryObj } from '@storybook/react';
import { TableHeader } from './TableHeader';
import { TableHead, TableRow as MuiTableRow } from '@mui/material';
import { useState } from 'react';

const meta: Meta<typeof TableHeader> = {
  title: 'Components/TableHeader',
  component: TableHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableHeader>;

export const NonSortable: Story = {
  render: () => (
    <table>
      <TableHead>
        <MuiTableRow>
          <TableHeader>Column Name</TableHeader>
        </MuiTableRow>
      </TableHead>
    </table>
  ),
};

export const SortableAscending: Story = {
  render: () => {
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | false>('asc');
    return (
      <table>
        <TableHead>
          <MuiTableRow>
            <TableHeader
              sortable
              active={true}
              sortDirection={sortDirection}
              onSort={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              Sortable Column
            </TableHeader>
          </MuiTableRow>
        </TableHead>
      </table>
    );
  },
};

export const SortableDescending: Story = {
  render: () => (
    <table>
      <TableHead>
        <MuiTableRow>
          <TableHeader
            sortable
            active={true}
            sortDirection="desc"
            onSort={() => {}}
          >
            Sortable Column
          </TableHeader>
        </MuiTableRow>
      </TableHead>
    </table>
  ),
};

