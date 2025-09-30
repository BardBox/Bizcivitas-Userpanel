import React from 'react';
import { PaginationState, PaginationActions } from './usePagination';
import PaginationControls from './PaginationControls';
import PaginationInfo from './PaginationInfo';

interface PaginationProps {
  state: PaginationState;
  actions: PaginationActions;
  itemName?: string;
  searchTerm?: string;
  showInfo?: boolean;
  showItemsPerPage?: boolean;
  showFirstLastButtons?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  itemsPerPageOptions?: number[];
  onPageChange?: (page: number) => void;
  className?: string;
  infoClassName?: string;
  controlsClassName?: string;
  layout?: 'stacked' | 'inline';
}

const Pagination: React.FC<PaginationProps> = ({
  state,
  actions,
  itemName = 'items',
  searchTerm,
  showInfo = true,
  showItemsPerPage = true,
  showFirstLastButtons = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  size = 'md',
  itemsPerPageOptions = [8, 12, 16, 20],
  onPageChange,
  className = '',
  infoClassName = '',
  controlsClassName = '',
  layout = 'stacked',
}) => {
  const { totalPages } = state;

  // Don't render if there's no pagination needed
  if (state.totalItems === 0) {
    return showInfo ? (
      <PaginationInfo
        state={state}
        itemName={itemName}
        searchTerm={searchTerm}
        showItemsPerPage={false}
        className={infoClassName}
      />
    ) : null;
  }

  const layoutClasses = {
    stacked: 'flex flex-col gap-4',
    inline: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {/* Pagination Info */}
      {showInfo && (
        <PaginationInfo
          state={state}
          itemName={itemName}
          searchTerm={searchTerm}
          showItemsPerPage={showItemsPerPage}
          itemsPerPageOptions={itemsPerPageOptions}
          onItemsPerPageChange={actions.setItemsPerPage}
          className={infoClassName}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationControls
          state={state}
          actions={actions}
          showFirstLastButtons={showFirstLastButtons}
          showPageNumbers={showPageNumbers}
          maxVisiblePages={maxVisiblePages}
          size={size}
          onPageChange={onPageChange}
          className={controlsClassName}
        />
      )}
    </div>
  );
};

export default Pagination;