# Reusable Pagination Components

A comprehensive set of pagination components and hooks for the BizCivitas dashboard.

## Components

### 1. `usePagination` Hook
A custom hook that manages pagination state and provides actions.

```typescript
import { usePagination } from '@/components/Dashboard/Pagination';

const { state, actions, paginatedData } = usePagination(data, {
  initialPage: 1,
  initialItemsPerPage: 8,
  itemsPerPageOptions: [8, 12, 16, 20],
  resetPageOnDataChange: true,
});
```

### 2. `Pagination` Component
The main pagination component that combines info and controls.

```typescript
import { Pagination } from '@/components/Dashboard/Pagination';

<Pagination
  state={pagination.state}
  actions={pagination.actions}
  itemName="connections"
  searchTerm={searchTerm}
  showInfo={true}
  showItemsPerPage={true}
  layout="stacked"
/>
```

### 3. `PaginationControls` Component
Navigation controls (previous, next, page numbers).

```typescript
import { PaginationControls } from '@/components/Dashboard/Pagination';

<PaginationControls
  state={pagination.state}
  actions={pagination.actions}
  showFirstLastButtons={true}
  showPageNumbers={true}
  maxVisiblePages={5}
  size="md"
/>
```

### 4. `PaginationInfo` Component
Displays pagination information and items per page selector.

```typescript
import { PaginationInfo } from '@/components/Dashboard/Pagination';

<PaginationInfo
  state={pagination.state}
  itemName="users"
  searchTerm={searchTerm}
  showItemsPerPage={true}
  itemsPerPageOptions={[8, 12, 16, 20]}
  onItemsPerPageChange={pagination.actions.setItemsPerPage}
/>
```

## Complete Example

```typescript
import React, { useState, useMemo } from 'react';
import { usePagination, Pagination } from '@/components/Dashboard/Pagination';

const MyComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data] = useState([/* your data array */]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Initialize pagination
  const pagination = usePagination(filteredData, {
    initialItemsPerPage: 8,
    itemsPerPageOptions: [8, 12, 16, 20],
  });

  // Get current page data
  const currentPageData = pagination.paginatedData(filteredData);

  return (
    <div>
      {/* Your search input */}
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />

      {/* Display current page data */}
      <div className="grid gap-4">
        {currentPageData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        state={pagination.state}
        actions={pagination.actions}
        itemName="items"
        searchTerm={searchTerm}
        className="mt-8"
      />
    </div>
  );
};
```

## Props Reference

### usePagination Config
- `initialPage?: number` - Starting page (default: 1)
- `initialItemsPerPage?: number` - Items per page (default: 8)
- `itemsPerPageOptions?: number[]` - Available options (default: [8, 12, 16, 20])
- `resetPageOnDataChange?: boolean` - Reset to page 1 when data changes (default: true)

### Pagination Props
- `state: PaginationState` - State from usePagination
- `actions: PaginationActions` - Actions from usePagination
- `itemName?: string` - Name for items (default: "items")
- `searchTerm?: string` - Current search term
- `showInfo?: boolean` - Show pagination info (default: true)
- `showItemsPerPage?: boolean` - Show items per page selector (default: true)
- `showFirstLastButtons?: boolean` - Show first/last buttons (default: true)
- `showPageNumbers?: boolean` - Show page numbers (default: true)
- `maxVisiblePages?: number` - Max visible page numbers (default: 5)
- `size?: 'sm' | 'md' | 'lg'` - Component size (default: 'md')
- `layout?: 'stacked' | 'inline'` - Layout style (default: 'stacked')

## State Management

The `usePagination` hook manages all pagination state internally:

- **currentPage**: Current active page
- **itemsPerPage**: Number of items per page
- **totalItems**: Total number of items
- **totalPages**: Total number of pages
- **startIndex**: Start index for current page
- **endIndex**: End index for current page
- **hasNextPage**: Whether there's a next page
- **hasPreviousPage**: Whether there's a previous page

## Actions Available

- `setCurrentPage(page: number)`: Go to specific page
- `setItemsPerPage(count: number)`: Change items per page
- `goToNextPage()`: Go to next page
- `goToPreviousPage()`: Go to previous page
- `goToFirstPage()`: Go to first page
- `goToLastPage()`: Go to last page
- `reset()`: Reset to initial state

## Features

✅ **Responsive Design**: Works on all screen sizes
✅ **TypeScript Support**: Full type safety
✅ **Customizable**: Flexible props and styling
✅ **Search Integration**: Handles filtered data
✅ **Auto Scroll**: Smooth scroll to top on page change
✅ **Smart Page Numbers**: Shows ellipsis for large page counts
✅ **Accessible**: Proper ARIA labels and keyboard navigation
✅ **Performance**: Optimized with useMemo and useCallback