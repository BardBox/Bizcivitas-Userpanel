import React from 'react';
import { PaginationState } from './usePagination';

interface PaginationInfoProps {
  state: PaginationState;
  itemName?: string;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  searchTerm?: string;
  className?: string;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  state,
  itemName = 'items',
  showItemsPerPage = true,
  itemsPerPageOptions = [8, 12, 16, 20],
  onItemsPerPageChange,
  searchTerm,
  className = '',
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    itemsPerPage,
  } = state;

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    onItemsPerPageChange?.(newItemsPerPage);
  };

  if (totalItems === 0) {
    return (
      <div className={`text-gray-600 ${className}`}>
        No {itemName} found
        {searchTerm && (
          <span className="ml-1">
            for &quot;{searchTerm}&quot;
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      {/* Results Summary */}
      <div className="text-gray-600">
        <span>
          Showing {startIndex + 1}-{endIndex} of {totalItems} {itemName}
        </span>
        {searchTerm && (
          <span className="ml-2 text-blue-600 font-medium">
            for &quot;{searchTerm}&quot;
          </span>
        )}
        {totalPages > 1 && (
          <span className="ml-2 text-gray-500">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      {/* Items per page selector */}
      {showItemsPerPage && totalItems > Math.min(...itemsPerPageOptions) && (
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
            Show:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default PaginationInfo;