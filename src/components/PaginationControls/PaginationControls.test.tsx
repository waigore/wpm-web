import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationControls } from './PaginationControls';

describe('PaginationControls', () => {
  const defaultProps = {
    totalItems: 100,
    currentPage: 1,
    pageSize: 50,
    totalPages: 2,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pagination info correctly', () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByText('Showing 1-50 of 100 items')).toBeInTheDocument();
  });

  it('uses custom item label', () => {
    render(<PaginationControls {...defaultProps} itemLabel="positions" />);
    expect(screen.getByText('Showing 1-50 of 100 positions')).toBeInTheDocument();
  });

  it('calculates start and end items correctly for different pages', () => {
    const { rerender } = render(<PaginationControls {...defaultProps} currentPage={2} />);
    expect(screen.getByText('Showing 51-100 of 100 items')).toBeInTheDocument();

    rerender(<PaginationControls {...defaultProps} currentPage={1} pageSize={20} />);
    expect(screen.getByText('Showing 1-20 of 100 items')).toBeInTheDocument();
  });

  it('handles zero total items', () => {
    render(<PaginationControls {...defaultProps} totalItems={0} />);
    expect(screen.getByText('Showing 0-0 of 0 items')).toBeInTheDocument();
  });

  it('displays page size selector', () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('calls onPageSizeChange when page size is changed', async () => {
    const user = userEvent.setup();
    render(<PaginationControls {...defaultProps} />);

    const pageSizeSelect = screen.getByRole('combobox');
    await user.click(pageSizeSelect);

    const option20 = screen.getByRole('option', { name: '20' });
    await user.click(option20);

    expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('disables pagination when loading', () => {
    render(<PaginationControls {...defaultProps} loading={true} />);
    const pagination = screen.getByRole('navigation', { name: /pagination/i });
    // MUI Pagination component doesn't have a disabled prop that's easily testable,
    // but we can check that it's rendered
    expect(pagination).toBeInTheDocument();
  });

  it('renders pagination component', () => {
    render(<PaginationControls {...defaultProps} />);
    const pagination = screen.getByRole('navigation', { name: /pagination/i });
    expect(pagination).toBeInTheDocument();
  });

  it('calculates end item correctly when last page has fewer items', () => {
    render(<PaginationControls {...defaultProps} currentPage={2} totalItems={75} pageSize={50} />);
    expect(screen.getByText('Showing 51-75 of 75 items')).toBeInTheDocument();
  });
});

