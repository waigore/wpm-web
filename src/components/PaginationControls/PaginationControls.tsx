import React from 'react';
import {
  Box,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

export interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
  itemLabel?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  loading = false,
  itemLabel = 'items',
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    const newSize = event.target.value as number;
    onPageSizeChange(newSize);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
      <Typography variant="body2">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Page Size</InputLabel>
          <Select
            value={pageSize}
            label="Page Size"
            onChange={handlePageSizeChange}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={onPageChange}
          color="primary"
          disabled={loading}
        />
      </Box>
    </Box>
  );
};

