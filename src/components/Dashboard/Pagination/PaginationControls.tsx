import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationState, PaginationActions } from './usePagination';

interface PaginationControlsProps {
  state: PaginationState;
  actions: PaginationActions;
  showFirstLastButtons?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onPageChange?: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  state,
  actions,
  showFirstLastButtons = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  size = 'md',
  className = '',
  onPageChange,
}) => {
  const {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = state;

  const {
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  } = actions;

  // Handle page change with optional callback
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate visible page numbers
  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    const end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePageNumbers();

  // Size-based styling
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      button: 'px-3 py-2 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      button: 'px-4 py-3 text-base',
      icon: 'h-5 w-5',
    },
  };

  const buttonClass = `${sizeClasses[size].button} border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors`;
  const activeButtonClass = `${sizeClasses[size].button} bg-blue-600 text-white border border-blue-600 rounded-lg`;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* First Page Button */}
      {showFirstLastButtons && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={!hasPreviousPage}
          className={`flex items-center gap-1 ${buttonClass}`}
          title="First page"
        >
          <ChevronsLeft className={sizeClasses[size].icon} />
          {size === 'lg' && <span>First</span>}
        </button>
      )}

      {/* Previous Button */}
      <button
        onClick={() => {
          goToPreviousPage();
          onPageChange?.(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={!hasPreviousPage}
        className={`flex items-center gap-1 ${buttonClass}`}
        title="Previous page"
      >
        <ChevronLeft className={sizeClasses[size].icon} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {/* Show ellipsis before if needed */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={currentPage === 1 ? activeButtonClass : buttonClass}
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="px-2 text-gray-400">...</span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={
                currentPage === page ? activeButtonClass : buttonClass
              }
            >
              {page}
            </button>
          ))}

          {/* Show ellipsis after if needed */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={
                  currentPage === totalPages ? activeButtonClass : buttonClass
                }
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={() => {
          goToNextPage();
          onPageChange?.(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={!hasNextPage}
        className={`flex items-center gap-1 ${buttonClass}`}
        title="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className={sizeClasses[size].icon} />
      </button>

      {/* Last Page Button */}
      {showFirstLastButtons && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNextPage}
          className={`flex items-center gap-1 ${buttonClass}`}
          title="Last page"
        >
          {size === 'lg' && <span>Last</span>}
          <ChevronsRight className={sizeClasses[size].icon} />
        </button>
      )}
    </div>
  );
};

export default PaginationControls;