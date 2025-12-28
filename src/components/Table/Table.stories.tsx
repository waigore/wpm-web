import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import { TableHead, TableBody, TableRow as MuiTableRow, TableCell } from '@mui/material';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <MuiTableRow>
          <TableCell>Header 1</TableCell>
          <TableCell>Header 2</TableCell>
          <TableCell>Header 3</TableCell>
        </MuiTableRow>
      </TableHead>
      <TableBody>
        <MuiTableRow>
          <TableCell>Row 1, Cell 1</TableCell>
          <TableCell>Row 1, Cell 2</TableCell>
          <TableCell>Row 1, Cell 3</TableCell>
        </MuiTableRow>
        <MuiTableRow>
          <TableCell>Row 2, Cell 1</TableCell>
          <TableCell>Row 2, Cell 2</TableCell>
          <TableCell>Row 2, Cell 3</TableCell>
        </MuiTableRow>
      </TableBody>
    </Table>
  ),
};

