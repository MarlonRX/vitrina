"use client";
import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Column } from "@/schemas/tableSchema";

interface TypedColumn<T> extends Omit<Column, 'render'> {
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  isSortable?: boolean;
  isActive: boolean;
  activeSortDirection: 'asc' | 'desc' | null;
  onSort: (key: string) => void;
}

const SortableHeader = ({
  label,
  sortKey,
  isSortable,
  isActive,
  activeSortDirection,
  onSort,
}: SortableHeaderProps) => {
  return (
    <button
      type="button"
      tabIndex={isSortable ? 0 : undefined}
      onClick={() => isSortable && onSort(sortKey)}
      onKeyDown={(e) => { if (isSortable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSort(sortKey); } }}
      className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-transform duration-200 ${isSortable
          ? 'cursor-pointer hover:text-(--accent-secondary) hover:-translate-y-0.5'
          : 'cursor-default'
        }`}
    >
      {label}
      {isSortable && (
        <ArrowUpDown
          className={`w-4 h-4 transition-opacity ${isActive ? 'text-(--accent-primary) opacity-100 scale-110' : 'opacity-70'
            }`}
        />
      )}
      {isActive && (
        <span className="text-[10px] font-mono ml-0.5">
          {activeSortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );
};

interface MyTableProps<T extends { id: string | number }> {
  data: T[];
  columns: TypedColumn<T>[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick?: (id: string | number) => void;
  variant?: 'default' | 'excel';
  showPagination?: boolean;
  /** Current sort field (external control) */
  sortField?: string;
  /** Current sort direction (external control) */
  sortDirection?: 'asc' | 'desc';
  /** Called when user clicks a sortable column header */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

export const MyTable = <T extends { id: string | number }>({
  data,
  columns,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  variant = 'default',
  showPagination = true,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSortChange,
}: MyTableProps<T>) => {
  // Internal sort fallback when onSortChange is NOT provided (backward compat)
  const [internalSort, setInternalSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const isExternallyControlled = !!onSortChange;
  const activeSortField = isExternallyControlled ? (externalSortField ?? null) : internalSort?.key ?? null;
  const activeSortDirection = isExternallyControlled ? (externalSortDirection ?? null) : internalSort?.direction ?? null;

  // Client-side sort (only used when sort is NOT externally controlled)
  const sortedData = (!isExternallyControlled && internalSort)
    ? [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[internalSort.key] as string | number;
      const bValue = (b as Record<string, unknown>)[internalSort.key] as string | number;
      const direction = internalSort.direction === 'asc' ? 1 : -1;
      return aValue > bValue ? direction : -direction;
    })
    : data;

  const handleSort = (key: string) => {
    if (isExternallyControlled) {
      const newDirection =
        externalSortField === key && externalSortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(key, newDirection);
    } else {
      setInternalSort(prev =>
        prev?.key === key && prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : { key, direction: 'asc' }
      );
    }
  };

  const displayData = isExternallyControlled ? data : sortedData;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const pagesSet = new Set<number | string>();
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    pagesSet.add(1);

    if (currentPage > 3) {
      pages.push('...');
      pagesSet.add('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pagesSet.has(i)) {
        pages.push(i);
        pagesSet.add(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 md:gap-6 flex-1 overflow-hidden">
      {/* Table Wrapper */}
      <div className={`w-full overflow-hidden flex-1 flex flex-col ${variant === 'excel'
          ? 'rounded-none border-2 border-(--border-primary) shadow-none'
          : 'rounded-lg md:rounded-xl bg-(--bg-surface) shadow-md border border-(--border-primary) hover:shadow-lg transition-shadow duration-300'
        }`}>
        <div className={variant === 'excel' ? "flex-1 overflow-x-auto overflow-y-auto custom-scrollbar" : "flex-1 overflow-x-auto overflow-y-auto custom-scrollbar"}>
          <table className={`w-full border-collapse min-w-full ${variant === 'excel' ? 'bg-(--bg-surface)' : 'bg-(--bg-surface)'}`}>
            <thead className={variant === 'excel' ? "sticky top-0 z-10" : ""}>
              <tr className={`${variant === 'excel'
                  ? 'bg-(--bg-secondary) border-b-2 border-(--border-primary) h-10'
                  : 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) border-b-2 border-(--accent-primary) h-14'
                }`}>
                {columns.map(column => (
                  <th
                    key={String(column.key)}
                    className={`${variant === 'excel'
                        ? 'px-2 md:px-4 py-2 text-(--text-secondary) font-bold border-r border-(--border-primary) last:border-r-0 sticky top-0 bg-(--bg-secondary) z-20 shadow-[0_1px_0_var(--border-primary)]'
                        : 'px-3 md:px-6 py-2 md:py-4 text-(--text-inverted) bg-transparent border-none whitespace-nowrap'
                      }`}
                  >
                    <SortableHeader
                      label={column.label}
                      sortKey={column.key}
                      isSortable={column.sortable !== false}
                      isActive={activeSortField === column.key}
                      activeSortDirection={activeSortDirection}
                      onSort={handleSort}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`${variant === 'excel'
                        ? 'border-b border-(--border-primary) hover:bg-(--border-light)'
                        : `border-b border-(--border-primary) transition-transform duration-200 cursor-pointer group ${index % 2 === 0
                          ? 'bg-(--bg-surface)'
                          : 'bg-[rgba(212,175,55,0.03)]'
                        } hover:bg-[rgba(var(--accent-primary-rgb),0.08)] hover:translate-x-1 hover:shadow-[inset_3px_0_0_0_var(--accent-primary)]`
                      }`}
                    onClick={() => onRowClick?.(row.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick?.(row.id); } }}
                  >
                    {columns.map(column => {
                      const value = (row as Record<string, unknown>)[column.key];
                      return (
                        <td
                          key={String(column.key)}
                          className={`${variant === 'excel'
                              ? 'px-2 md:px-4 py-2 text-(--text-primary) text-xs md:text-sm border-r border-(--border-primary) last:border-r-0 whitespace-nowrap overflow-hidden text-ellipsis font-mono'
                              : 'px-3 md:px-6 py-2 md:py-4 text-(--text-primary) text-xs md:text-sm border-none whitespace-nowrap overflow-hidden text-ellipsis group-odd:text-(--text-secondary)'
                            }`}
                        >
                          {column.render
                            ? (column.render(value, row) as React.ReactNode)
                            : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-(--text-secondary)">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap py-2 px-2 md:px-0">
          {/* Previous Button */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`p-1.5 md:p-2 rounded-lg transition-transform duration-300 ${currentPage === 1
                ? 'bg-(--border-primary) text-(--text-tertiary) cursor-not-allowed opacity-50'
                : 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) text-(--text-inverted) hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md'
              }`}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 md:gap-2">
            {generatePageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-1 md:px-2 text-(--text-secondary) text-xs md:text-base">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`w-7 h-7 md:w-10 md:h-10 rounded-lg font-semibold text-xs md:text-sm transition-transform duration-300 ${currentPage === page
                      ? 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) text-(--text-inverted) shadow-lg scale-105'
                      : 'bg-(--border-primary) text-(--text-secondary) hover:bg-(--border-secondary) hover:-translate-y-0.5'
                    }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`p-1.5 md:p-2 rounded-lg transition-transform duration-300 ${currentPage === totalPages
                ? 'bg-(--border-primary) text-(--text-tertiary) cursor-not-allowed opacity-50'
                : 'bg-linear-to-r from-(--accent-primary) to-(--accent-hover) text-(--text-inverted) hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md'
              }`}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </div>
  );
};