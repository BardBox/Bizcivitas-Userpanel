'use client';

import { useState } from 'react';

// Fake product data
const PRODUCTS = [
  { id: 1, name: 'Laptop Pro X1', price: 1299.99, category: 'Electronics', image: '💻' },
  { id: 2, name: 'Wireless Mouse', price: 29.99, category: 'Accessories', image: '🖱️' },
  { id: 3, name: 'Mechanical Keyboard', price: 89.99, category: 'Accessories', image: '⌨️' },
  { id: 4, name: 'USB-C Hub', price: 49.99, category: 'Accessories', image: '🔌' },
  { id: 5, name: 'Monitor 27"', price: 349.99, category: 'Electronics', image: '🖥️' },
  { id: 6, name: 'Desk Lamp', price: 39.99, category: 'Furniture', image: '💡' },
  { id: 7, name: 'Office Chair', price: 299.99, category: 'Furniture', image: '🪑' },
  { id: 8, name: 'Headphones', price: 199.99, category: 'Audio', image: '🎧' },
  { id: 9, name: 'Webcam HD', price: 79.99, category: 'Electronics', image: '📷' },
  { id: 10, name: 'Phone Stand', price: 19.99, category: 'Accessories', image: '📱' },
  { id: 11, name: 'Tablet Pro', price: 799.99, category: 'Electronics', image: '📱' },
  { id: 12, name: 'Smart Watch', price: 399.99, category: 'Wearables', image: '⌚' },
  { id: 13, name: 'Bluetooth Speaker', price: 69.99, category: 'Audio', image: '🔊' },
  { id: 14, name: 'Power Bank', price: 39.99, category: 'Accessories', image: '🔋' },
  { id: 15, name: 'Desk Mat', price: 24.99, category: 'Accessories', image: '📐' },
  { id: 16, name: 'Standing Desk', price: 499.99, category: 'Furniture', image: '🏢' },
  { id: 17, name: 'Cable Organizer', price: 14.99, category: 'Accessories', image: '🔗' },
  { id: 18, name: 'External SSD 1TB', price: 129.99, category: 'Storage', image: '💾' },
  { id: 19, name: 'Gaming Mouse Pad', price: 34.99, category: 'Gaming', image: '🎮' },
  { id: 20, name: 'Ring Light', price: 59.99, category: 'Photography', image: '💍' },
  { id: 21, name: 'Microphone USB', price: 89.99, category: 'Audio', image: '🎤' },
  { id: 22, name: 'Drawing Tablet', price: 249.99, category: 'Creative', image: '✏️' },
  { id: 23, name: 'Laptop Stand', price: 44.99, category: 'Accessories', image: '📊' },
  { id: 24, name: 'Wireless Charger', price: 29.99, category: 'Accessories', image: '⚡' },
  { id: 25, name: 'Backpack Tech', price: 79.99, category: 'Bags', image: '🎒' },
];

const ITEMS_PER_PAGE = 6;

export default function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = PRODUCTS.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js Pagination Demo 🚀
          </h1>
          <p className="text-lg text-gray-600">
            Learn how pagination works with {PRODUCTS.length} products
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, PRODUCTS.length)} of {PRODUCTS.length}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="text-6xl text-center mb-4">{product.image}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  ${product.price}
                </span>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              ← Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  disabled={page === '...'}
                  className={`min-w-[40px] h-10 rounded-lg font-medium transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white shadow-lg scale-110'
                      : page === '...'
                      ? 'bg-transparent text-gray-400 cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Next →
            </button>
          </div>

          {/* Page Info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>

      </div>
    </div>
  );
}
