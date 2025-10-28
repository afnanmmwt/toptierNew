"use client";

import React from "react";
import { Icon } from "@iconify/react";

// === Props Interface ===
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPageChange: (page: number) => void;
  loading?: boolean;
  showEdges?: boolean; // Show first/last buttons (optional)
  siblingCount?: number; // Number of pages around current (default: 1)
  className?: string; // Custom wrapper class
}

// === Main Component ===
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasPrevious = true,
  hasNext = true,
  onPageChange,
  loading = false,
  showEdges = false,
  siblingCount = 1,
  className = "",
}) => {
  // Generate range helper
  const range = (start: number, end: number): number[] => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Generate visible pages with ellipsis logic
  const generatePages = (): (number | string)[] => {
    const totalPageNumbers = siblingCount * 2 + 3 + (showEdges ? 2 : 0);

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSibling > 2;
    const shouldShowRightEllipsis = rightSibling < totalPages - 1;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftRange = range(1, 3);
      return [...leftRange, "...", totalPages - 1, totalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightRange = range(totalPages - 2, totalPages);
      return [1, 2, "...", ...rightRange];
    }

    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const middleRange = range(leftSibling, rightSibling);
      return [1, "...", ...middleRange, "...", totalPages];
    }

    return range(1, totalPages);
  };

  const pages = generatePages();

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    onPageChange(page);
  };

  return (
    <nav
      className={`flex w-full flex-wrap items-center justify-center gap-1 mt-6 ${className}`}
      aria-label="Pagination"
    >
      {/* First Page Button (Optional) */}
      {showEdges && (
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1 || loading}
          className={`px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Go to first page"
        >
          «
        </button>
      )}

      {/* Previous Button */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={!hasPrevious || loading}
        className={`px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          !hasPrevious || loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Previous page"
      >
        <Icon icon="ic:baseline-chevron-left" width="18" />
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && handlePageClick(page)}
          disabled={loading}
          aria-current={typeof page === "number" && currentPage === page ? "page" : undefined}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] transition-all duration-200 ${
            typeof page === "number"
              ? currentPage === page
                ? "bg-blue-600 text-white font-semibold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              : "text-gray-400 dark:text-gray-500 pointer-events-none"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={!hasNext || loading}
        className={`px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          !hasNext || loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Next page"
      >
        <Icon icon="ic:baseline-chevron-right" width="18" />
      </button>

      {/* Last Page Button (Optional) */}
      {showEdges && (
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages || loading}
          className={`px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            currentPage === totalPages || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Go to last page"
        >
          »
        </button>
      )}
    </nav>
  );
};

export default Pagination;