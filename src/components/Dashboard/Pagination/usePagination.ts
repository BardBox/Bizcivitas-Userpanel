import { useState, useMemo, useEffect } from 'react';

export interface PaginationConfig {
  initialPage?: number;
  initialItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  resetPageOnDataChange?: boolean;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationActions {
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  reset: () => void;
}

export interface UsePaginationReturn {
  state: PaginationState;
  actions: PaginationActions;
  paginatedData: <T>(data: T[]) => T[];
}

export const usePagination = <T,>(
  data: T[],
  config: PaginationConfig = {}
): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialItemsPerPage = 8,
    itemsPerPageOptions = [8, 12, 16, 20],
    resetPageOnDataChange = true,
  } = config;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Reset to first page when data changes (if enabled)
  useEffect(() => {
    if (resetPageOnDataChange) {
      setCurrentPage(1);
    }
  }, [data.length, resetPageOnDataChange]);

  // Calculate pagination state
  const state: PaginationState = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [data.length, currentPage, itemsPerPage]);

  // Actions
  const actions: PaginationActions = useMemo(() => ({
    setCurrentPage: (page: number) => {
      const clampedPage = Math.max(1, Math.min(page, state.totalPages));
      setCurrentPage(clampedPage);
    },
    setItemsPerPage: (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    },
    goToNextPage: () => {
      if (state.hasNextPage) {
        setCurrentPage(prev => prev + 1);
      }
    },
    goToPreviousPage: () => {
      if (state.hasPreviousPage) {
        setCurrentPage(prev => prev - 1);
      }
    },
    goToFirstPage: () => setCurrentPage(1),
    goToLastPage: () => setCurrentPage(state.totalPages),
    reset: () => {
      setCurrentPage(initialPage);
      setItemsPerPage(initialItemsPerPage);
    },
  }), [state.hasNextPage, state.hasPreviousPage, state.totalPages, initialPage, initialItemsPerPage]);

  // Paginated data function
  const paginatedData = <T,>(sourceData: T[]): T[] => {
    return sourceData.slice(state.startIndex, state.endIndex);
  };

  return {
    state,
    actions,
    paginatedData,
  };
};