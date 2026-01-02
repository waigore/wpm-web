import { useState } from 'react';

/**
 * Custom hook for managing table sorting state.
 * Provides sort column, sort order, and handlers for sorting functionality.
 *
 * @param initialSort - The initial column to sort by
 * @returns Object containing sortBy, sortOrder, handleSort, and getSortDirection
 */
export function useTableSort<T extends string>(initialSort: T) {
  const [sortBy, setSortBy] = useState<T>(initialSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: T) => {
    const newSortOrder: 'asc' | 'desc' = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const getSortDirection = (column: T): 'asc' | 'desc' | false => {
    if (sortBy === column) {
      return sortOrder;
    }
    return false;
  };

  return { sortBy, sortOrder, handleSort, getSortDirection };
}

