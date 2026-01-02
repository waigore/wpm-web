import type { Meta, StoryObj } from '@storybook/react';
import { PaginationControls } from './PaginationControls';
import { fn } from '@storybook/test';

const meta: Meta<typeof PaginationControls> = {
  title: 'Components/PaginationControls',
  component: PaginationControls,
  tags: ['autodocs'],
  args: {
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof PaginationControls>;

export const Default: Story = {
  args: {
    totalItems: 100,
    currentPage: 1,
    pageSize: 50,
    totalPages: 2,
    itemLabel: 'items',
  },
};

export const WithCustomLabel: Story = {
  args: {
    totalItems: 237,
    currentPage: 1,
    pageSize: 50,
    totalPages: 5,
    itemLabel: 'positions',
  },
};

export const SecondPage: Story = {
  args: {
    totalItems: 100,
    currentPage: 2,
    pageSize: 50,
    totalPages: 2,
    itemLabel: 'items',
  },
};

export const Loading: Story = {
  args: {
    totalItems: 100,
    currentPage: 1,
    pageSize: 50,
    totalPages: 2,
    itemLabel: 'items',
    loading: true,
  },
};

export const ManyPages: Story = {
  args: {
    totalItems: 1000,
    currentPage: 5,
    pageSize: 20,
    totalPages: 50,
    itemLabel: 'trades',
  },
};

export const SinglePage: Story = {
  args: {
    totalItems: 10,
    currentPage: 1,
    pageSize: 50,
    totalPages: 1,
    itemLabel: 'items',
  },
};

export const Empty: Story = {
  args: {
    totalItems: 0,
    currentPage: 1,
    pageSize: 50,
    totalPages: 0,
    itemLabel: 'items',
  },
};

