'use client';

import { useState, useEffect } from 'react';

import {
  ActionTable,
  ActionTableColumn,
} from '@/components/actions/ActionTable';
import { Plus } from 'lucide-react';

interface ActionTranslation {
  languageCode: string;
  name: string;
  description: string;
}

interface Action {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  color: string;
  translations: ActionTranslation[];
}

interface PaginatedResponse {
  items: Action[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ActionSettingsSection() {
  const [tableData, setTableData] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentSort, setCurrentSort] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  }>({ column: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const fetchActions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: currentSort.column,
        sortOrder: currentSort.direction,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/actions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch actions');
      }

      const data: PaginatedResponse = await response.json();
      setTableData(data.items);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err: any) {
      console.error('Error fetching actions:', err);
      setError(err.message || 'Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.page,
    pagination.limit,
    currentSort.column,
    currentSort.direction,
    searchTerm,
  ]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setCurrentSort({ column, direction });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const columns: ActionTableColumn<Action>[] = [
    {
      key: 'iconUrl',
      label: 'Icon',
      render: (item: Action) => {
        return (
          <div className="h-10 w-10 rounded object-cover">
            {item.iconUrl ? (
              <img
                src={item.iconUrl}
                alt={item.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-200 flex items-center justify-center">
                <span className="text-xs text-slate-400">No icon</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'color',
      label: 'Color',
      render: (item: Action) => {
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded border border-slate-300"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-mono">{item.color}</span>
          </div>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
    },
  ];
  if (loading) {
    return (
      <section className="flex h-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-500">Loading actions...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex h-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-500">Error loading actions: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Action Settings
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          <Plus className="w-4 h-4" />
          Add Action
        </button>
      </div>
      <ActionTable
        data={tableData as unknown as Record<string, unknown>[]}
        columns={
          columns as unknown as ActionTableColumn<Record<string, unknown>>[]
        }
        pagination={pagination}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSort={handleSort}
        onSearch={handleSearch}
        currentSort={currentSort}
        searchTerm={searchTerm}
      />
    </div>
  );
}
