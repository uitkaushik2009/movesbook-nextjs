import { useRef, useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import {
  ActionTable,
  ActionTableColumn,
} from '@/components/actions/ActionTable';
import {
  AddActionPlannerDialog,
  AddActionPlannerFormData,
} from '@/components/actions/AddActionPlannerDialog';
import {
  AddUserFromDBDialog,
  User,
} from '@/components/actions/AddUserFromDBDialog';
import { ActionPlannerCreateFrom } from '@/types';

interface ActionPlannerTableData extends Record<string, unknown> {
  id: string;
  username: string;
  fullName: string;
  imageUrl: string;
  category: string;
  startDate: string;
  createFrom: ActionPlannerCreateFrom;
  origin: string;
}

interface ActionPlanner {
  id: string;
  username: string;
  name: string;
  surname: string;
  fullName: string;
  dateOfBirth: string;
  description: string;
  imageUrl: string;
  category: string;
  annotation: string;
  startDate: string;
  email: string;
  createFrom: ActionPlannerCreateFrom;
  origin: string;
}

export default function ActionPlannersSection() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [actionPlannersTableData, setActionPlannersTableData] = useState<
    ActionPlannerTableData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const fetchActionPlannersTableData = async (
    page: number = currentPage,
    limit: number = itemsPerPage,
    search: string = searchTerm,
    sort: { column: string; direction: 'asc' | 'desc' } | null = currentSort
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (sort) {
        params.append('sortBy', sort.column);
        params.append('sortOrder', sort.direction);
      }

      const response = await fetch(`/api/action-planners?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch action planners');
      }
      const data = await response.json();

      // Handle both array response and paginated response
      if (Array.isArray(data)) {
        setActionPlannersTableData(data);
        setTotal(data.length);
      } else {
        setActionPlannersTableData(data.items || data.data || []);
        setTotal(data.total || 0);
      }
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch action planners'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionPlannersTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCreateFromScratch = () => {
    setIsDropdownOpen(false);
    setIsDialogOpen(true);
  };

  const handleCreateFromMovesbook = () => {
    setIsDropdownOpen(false);
    setIsUserDialogOpen(true);
  };

  // Action Table Handlers
  const handleTableEdit = () => {
    console.log('Edit action planner');
  };

  const handleTableDelete = () => {
    console.log('Delete action planner');
  };

  const handleTableSet = () => {
    console.log('Set action planner');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchActionPlannersTableData(page, itemsPerPage, searchTerm, currentSort);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    fetchActionPlannersTableData(1, limit, searchTerm, currentSort);
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const newSort = { column, direction };
    setCurrentSort(newSort);
    setCurrentPage(1);
    fetchActionPlannersTableData(1, itemsPerPage, searchTerm, newSort);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
    fetchActionPlannersTableData(1, itemsPerPage, search, currentSort);
  };

  // Search users function for AddUserFromDBDialog
  const handleSearchUsers = async (
    query: string,
    worldwide: boolean,
    page: number = 1,
    limit: number = 6
  ): Promise<{ users: User[]; hasMore: boolean }> => {
    try {
      const token = localStorage.getItem('token');
      const searchParams = new URLSearchParams();
      if (query) {
        searchParams.append('search', query);
      }

      const response = await fetch(
        `/api/admin/users/list?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      const allUsers: User[] = (data.users || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
      }));

      // Client-side pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const users = allUsers.slice(startIndex, endIndex);
      const hasMore = endIndex < allUsers.length;

      return { users, hasMore };
    } catch (error) {
      console.error('Error searching users:', error);
      return { users: [], hasMore: false };
    }
  };

  // Handle adding a user from the dialog
  const handleAddUser = (user: User) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev;
      }
      return [...prev, user];
    });
  };

  // Handle removing a user from the dialog
  const handleRemoveUser = (userId: number | string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Handle closing user dialog and creating action planners from selected users
  const handleUserDialogClose = async () => {
    if (selectedUsers.length > 0) {
      try {
        // Create action planners from selected users
        for (const user of selectedUsers) {
          const formDataToSend = new FormData();
          formDataToSend.append('username', user.username || '');
          formDataToSend.append('name', user.name.split(' ')[0] || user.name);
          formDataToSend.append(
            'surname',
            user.name.split(' ').slice(1).join(' ') || ''
          );
          formDataToSend.append('fullName', user.name);
          formDataToSend.append('email', user.email || '');
          formDataToSend.append('category', 'From Movesbook');
          formDataToSend.append('annotation', '');
          formDataToSend.append(
            'startDate',
            new Date().toISOString().split('T')[0]
          );
          formDataToSend.append('dateOfBirth', '');

          const response = await fetch('/api/action-planners', {
            method: 'POST',
            body: formDataToSend,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                `Failed to create action planner for ${user.name}`
            );
          }
        }

        // Clear selected users and close dialog
        setSelectedUsers([]);
        setIsUserDialogOpen(false);
        await fetchActionPlannersTableData(
          currentPage,
          itemsPerPage,
          searchTerm,
          currentSort
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to create action planners from users'
        );
      }
    } else {
      setIsUserDialogOpen(false);
    }
  };

  const handleDialogSubmit = async (
    formData: AddActionPlannerFormData,
    isEdit: boolean,
    id?: string
  ) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('surname', formData.surname);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('annotation', formData.annotation);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('email', formData.email);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url =
        isEdit && id ? `/api/action-planners/${id}` : '/api/action-planners';

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save action planner');
      }

      // Close dialog and refresh data
      setIsDialogOpen(false);
      await fetchActionPlannersTableData(
        currentPage,
        itemsPerPage,
        searchTerm,
        currentSort
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to save action planner'
      );
    }
  };

  const columns: ActionTableColumn<ActionPlannerTableData>[] = [
    {
      key: 'imageUrl',
      label: 'Image',
      imageKey: 'imageUrl',
      render: (item) =>
        item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.fullName}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-slate-400">No image</span>
        ),
    },
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (item) => new Date(item.startDate).toLocaleDateString(),
      sortable: true,
    },
    { key: 'createFrom', label: 'Create From', sortable: true },
    { key: 'origin', label: 'Origin', sortable: true },
  ];

  // const data = actionPlannersTableData.map((actionPlannerTableData) => ({
  //   id: actionPlannerTableData.id,
  //   username: actionPlannerTableData.username,
  //   fullName: actionPlannerTableData.fullName,
  //   category: actionPlannerTableData.category,
  //   startDate: actionPlannerTableData.startDate,
  //   createFrom: actionPlannerTableData.createFrom as 'scratch' | 'movesbook',
  // }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Action Planners</h2>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-white transition hover:bg-emerald-600"
          >
            <span>Add Action Planner</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg">
              <div className="py-1">
                <button
                  onClick={handleCreateFromScratch}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  From Scratch
                </button>
                <button
                  onClick={handleCreateFromMovesbook}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  From Movesbook Users
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <ActionTable<ActionPlannerTableData>
          columns={columns}
          data={actionPlannersTableData}
          onEdit={handleTableEdit}
          onDelete={handleTableDelete}
          onSet={handleTableSet}
          pagination={{
            page: currentPage,
            limit: itemsPerPage,
            total: total,
            totalPages: Math.ceil(total / itemsPerPage),
          }}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onSort={handleSort}
          onSearch={handleSearch}
          currentSort={currentSort || undefined}
          searchTerm={searchTerm}
          showSearch={true}
          showPrint={true}
          showViewChange={true}
          showLanguage={false}
        />
      )}
      {error && (
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      <AddActionPlannerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        mode="create"
      />

      <AddUserFromDBDialog
        isOpen={isUserDialogOpen}
        onClose={handleUserDialogClose}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        addedUserIds={selectedUsers.map((u) => u.id)}
        onSearch={handleSearchUsers}
      />
    </div>
  );
}
