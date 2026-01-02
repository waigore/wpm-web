import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableSort } from './useTableSort';

type TestSortField = 'name' | 'date' | 'value';

describe('useTableSort', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('name'));

    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('handles sort on new column (sets to asc)', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('name'));

    act(() => {
      result.current.handleSort('date');
    });

    expect(result.current.sortBy).toBe('date');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('toggles sort order when clicking same column', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('name'));

    expect(result.current.sortOrder).toBe('asc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('desc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('getSortDirection returns false for non-active column', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('name'));

    expect(result.current.getSortDirection('date')).toBe(false);
    expect(result.current.getSortDirection('value')).toBe(false);
  });

  it('getSortDirection returns current sort order for active column', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('name'));

    expect(result.current.getSortDirection('name')).toBe('asc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.getSortDirection('name')).toBe('desc');
  });

  it('works with different initial sort column', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('date'));

    expect(result.current.sortBy).toBe('date');
    expect(result.current.sortOrder).toBe('asc');
    expect(result.current.getSortDirection('date')).toBe('asc');
    expect(result.current.getSortDirection('name')).toBe(false);
  });

  it('switches to new column and resets to asc when sorting different column', () => {
    const { result } = renderHook(() => useTableSort<TestSortField>('name'));

    // First set name to desc
    act(() => {
      result.current.handleSort('name');
    });
    expect(result.current.sortOrder).toBe('desc');

    // Then sort by date - should reset to asc
    act(() => {
      result.current.handleSort('date');
    });

    expect(result.current.sortBy).toBe('date');
    expect(result.current.sortOrder).toBe('asc');
  });
});

