'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { Edit, Trash, Settings } from 'lucide-react';

export type ActionTableColumn<T> = {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  imageKey?: string; // Key for image URL in data for image preview view
};

export type ActionTableProps<T> = {
  data: T[];
  columns: ActionTableColumn<T>[];
  onEdit?: (item: T) => void;
  onSet?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  printable?: boolean;
  viewChangeable?: boolean;
  showLanguage?: boolean;
  showSearch?: boolean;
  showPrint?: boolean;
  showViewChange?: boolean;
  // Server-side pagination props
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSearch?: (search: string) => void;
  onLanguageChange?: (language: string) => void;
  currentSort?: { column: string; direction: 'asc' | 'desc' };
  searchTerm?: string;
  currentLanguage?: string;
};

type ViewMode = 'table' | 'textOnly';

export function ActionTable<T extends Record<string, unknown>>({
  data,
  columns,
  onEdit,
  onSet,
  onDelete,
  searchable = true,
  sortable = true,
  printable = true,
  viewChangeable = true,
  showLanguage = true,
  showSearch = true,
  showPrint = true,
  showViewChange = true,
  pagination: serverPagination,
  onPageChange,
  onItemsPerPageChange,
  onSort,
  onSearch,
  onLanguageChange,
  currentSort,
  searchTerm: serverSearchTerm,
  currentLanguage: serverLanguage,
}: ActionTableProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    serverLanguage || 'en'
  );

  // Local search input state to prevent focus loss
  const [localSearchInput, setLocalSearchInput] = useState(
    serverSearchTerm || ''
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local search input only when serverSearchTerm is cleared externally
  useEffect(() => {
    if (serverSearchTerm === '' && localSearchInput !== '') {
      setLocalSearchInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSearchTerm]);

  // Use server-side values
  const itemsPerPage = serverPagination?.limit || 10;
  const currentPage = serverPagination?.page || 1;
  const sortColumn = currentSort?.column || null;
  const sortDirection = currentSort?.direction || 'asc';
  const totalPages = serverPagination?.totalPages || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data;

  const handleSort = (columnKey: string) => {
    if (onSort) {
      const newDirection =
        sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(columnKey, newDirection);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Table</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>Table Data</h2>
            <table>
              <thead>
                <tr>
                  ${columns
                    .map((col: ActionTableColumn<T>) => `<th>${col.label}</th>`)
                    .join('')}
                  ${onEdit || onSet || onDelete ? '<th>Actions</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (item: T) => `
                  <tr>
                    ${columns
                      .map(
                        (col: ActionTableColumn<T>) =>
                          `<td>${
                            col.render
                              ? col.render(item)
                              : String(item[col.key] || '')
                          }</td>`
                      )
                      .join('')}
                    ${onEdit || onSet || onDelete ? '<td>-</td>' : ''}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              #
            </th>
            {columns.map((column: ActionTableColumn<T>) => {
              const isSortable =
                column.sortable !== false && sortable && !column.imageKey; // Disable sort for image columns
              return (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-slate-700 ${
                    isSortable ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  onClick={() =>
                    isSortable ? handleSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
            {(onEdit || onSet || onDelete) && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length + 1 + (onEdit || onSet || onDelete ? 1 : 0)
                }
                className="px-4 py-8 text-center text-sm text-slate-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            paginatedData.map((item: T, index: number) => (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-sm text-slate-600">
                  {startIndex + index + 1}
                </td>
                {columns.map((column: ActionTableColumn<T>) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-sm text-slate-600"
                  >
                    {column.render
                      ? column.render(item)
                      : String(item[column.key] || '')}
                  </td>
                ))}
                {(onEdit || onSet || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="rounded bg-blue-500 px-3 py-1 text-xs text-white transition hover:bg-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onSet && (
                        <button
                          onClick={() => onSet(item)}
                          className="rounded bg-green-500 px-3 py-1 text-xs text-white transition hover:bg-green-600"
                          title="Set"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="rounded bg-red-500 px-3 py-1 text-xs text-white transition hover:bg-red-600"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTextOnlyView = () => {
    // Filter out image columns for table view
    const tableColumns = columns.filter(
      (column: ActionTableColumn<T>) => !column.imageKey
    );

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                #
              </th>
              {tableColumns.map((column: ActionTableColumn<T>) => {
                const isSortable =
                  column.sortable !== false && sortable && !column.imageKey; // Disable sort for image columns
                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-sm font-semibold text-slate-700 ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100' : ''
                    }`}
                    onClick={() =>
                      isSortable ? handleSort(column.key) : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              {(onEdit || onSet || onDelete) && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    tableColumns.length +
                    1 +
                    (onEdit || onSet || onDelete ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((item: T, index: number) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {startIndex + index + 1}
                  </td>
                  {tableColumns.map((column: ActionTableColumn<T>) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-slate-600"
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.key] || '')}
                    </td>
                  ))}
                  {(onEdit || onSet || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="rounded bg-blue-500 px-3 py-1 text-xs text-white transition hover:bg-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onSet && (
                          <button
                            onClick={() => onSet(item)}
                            className="rounded bg-green-500 px-3 py-1 text-xs text-white transition hover:bg-green-600"
                            title="Set"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="rounded bg-red-500 px-3 py-1 text-xs text-white transition hover:bg-red-600"
                            title="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutRef = searchTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Items per page dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                if (onItemsPerPageChange) {
                  onItemsPerPageChange(newLimit);
                }
              }}
              className="rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Language Select dropdown */}
          {showLanguage && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Language:</label>
              <select
                value={selectedLanguage || 'en'}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setSelectedLanguage(newLang);
                  if (onLanguageChange) {
                    onLanguageChange(newLang);
                  }
                }}
                className="rounded border border-slate-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="en">🇬🇧 English</option>
                <option value="it">🇮🇹 Italian</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="fr">🇫🇷 French</option>
                <option value="de">🇩🇪 German</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          {searchable && showSearch && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={localSearchInput}
                onChange={(e) => {
                  setLocalSearchInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  // Allow Enter key to trigger search
                  if (e.key === 'Enter' && onSearch) {
                    onSearch(localSearchInput);
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                  }
                }}
                className="rounded border border-slate-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (onSearch) {
                    onSearch(localSearchInput);
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                  }
                }}
                className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          )}

          {/* Print button */}
          {printable && showPrint && (
            <button
              onClick={handlePrint}
              className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-200"
            >
              Print
            </button>
          )}

          {/* View change button */}
          {viewChangeable && showViewChange && (
            <div className="flex items-center gap-1 rounded border border-slate-300 bg-white p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded px-2 py-1 text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Table View"
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('textOnly')}
                className={`rounded px-2 py-1 text-xs transition ${
                  viewMode === 'textOnly'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Text Only"
              >
                Text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table content */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'textOnly' && renderTextOnlyView()}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
        {/* Status text */}
        <div className="text-sm text-slate-600">
          {(() => {
            const total = serverPagination?.total || 0;
            const start = (currentPage - 1) * itemsPerPage + 1;
            const end = Math.min(currentPage * itemsPerPage, total);

            if (total === 0) {
              return 'No entries';
            }
            return `Showing ${start} to ${end} of ${total} entries`;
          })()}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Prev button */}
          <button
            onClick={() => {
              const newPage = Math.max(1, currentPage - 1);
              if (onPageChange) {
                onPageChange(newPage);
              }
            }}
            disabled={currentPage === 1}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              currentPage === 1
                ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
          >
            Prev
          </button>

          {/* Page number buttons */}
          <div className="flex items-center gap-1">
            {(() => {
              const pages: number[] = [];
              const maxVisible = 6;
              let startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, startPage + maxVisible - 1);

              // Adjust start if we're near the end
              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }

              return pages.map((page: number) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => {
                      if (onPageChange) {
                        onPageChange(page);
                      }
                    }}
                    className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
          </div>

          {/* Next button */}
          <button
            onClick={() => {
              const newPage = Math.min(totalPages, currentPage + 1);
              if (onPageChange) {
                onPageChange(newPage);
              }
            }}
            disabled={currentPage >= totalPages}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              currentPage >= totalPages
                ? 'cursor-not-allowed bg-white text-slate-400'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
