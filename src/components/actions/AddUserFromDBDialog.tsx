'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';

export interface User {
  id: number | string;
  name: string;
  username?: string;
  email?: string;
  image?: string;
  imageUrl?: string;
}

interface AddUserFromDBDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser?: (user: User) => void;
  onRemoveUser?: (userId: number | string) => void;
  addedUserIds?: (number | string)[];
  onSearch?: (
    query: string,
    worldwide: boolean,
    page?: number,
    limit?: number
  ) => Promise<{ users: User[]; hasMore: boolean }>;
}

const INITIAL_ITEMS_COUNT = 6;
const ITEMS_PER_LOAD = 6;

export function AddUserFromDBDialog({
  isOpen,
  onClose,
  onAddUser,
  onRemoveUser,
  addedUserIds = [],
  onSearch,
}: AddUserFromDBDialogProps) {
  const [worldwide, setWorldwide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Load initial users when dialog opens
  const loadInitialUsers = useCallback(async () => {
    if (!onSearch || hasLoadedInitial) return;

    setIsSearching(true);
    setSearchError(null);
    setCurrentPage(1);
    setHasMore(false);

    try {
      const result = await onSearch('', worldwide, 1, INITIAL_ITEMS_COUNT);
      setDisplayedUsers(result.users);
      setHasMore(result.hasMore);
      setHasLoadedInitial(true);
    } catch (error) {
      console.error('Error loading initial users:', error);
      setSearchError(
        error instanceof Error ? error.message : 'Failed to load users'
      );
      setDisplayedUsers([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearch, worldwide, hasLoadedInitial]);

  // Auto-load users when dialog opens
  useEffect(() => {
    if (isOpen && !hasLoadedInitial) {
      loadInitialUsers();
    }
  }, [isOpen, hasLoadedInitial, loadInitialUsers]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setCurrentPage(1);
    setHasMore(false);

    try {
      if (onSearch) {
        const result = await onSearch(
          searchQuery,
          worldwide,
          1,
          INITIAL_ITEMS_COUNT
        );
        setDisplayedUsers(result.users);
        setHasMore(result.hasMore);
      } else {
        // Fallback mock data if no search function provided
        setTimeout(() => {
          const mockUsers = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            username: `user${i + 1}`,
            image: 'https://via.placeholder.com/50',
          }));
          setDisplayedUsers(mockUsers.slice(0, INITIAL_ITEMS_COUNT));
          setHasMore(mockUsers.length > INITIAL_ITEMS_COUNT);
          setIsSearching(false);
        }, 500);
        return;
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(
        error instanceof Error ? error.message : 'Failed to search users'
      );
      setDisplayedUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreUsers = useCallback(async () => {
    if (isLoadingMore || !hasMore || !onSearch) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await onSearch(
        searchQuery,
        worldwide,
        nextPage,
        ITEMS_PER_LOAD
      );

      if (result.users.length > 0) {
        setDisplayedUsers((prev) => [...prev, ...result.users]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, onSearch, searchQuery, worldwide, currentPage]);

  // Handle scroll for lazy loading
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !hasMore || isLoadingMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Load more when user is 100px from bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMoreUsers();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMoreUsers]);

  const handleAddRemove = (user: User) => {
    if (addedUserIds.includes(user.id)) {
      onRemoveUser?.(user.id);
    } else {
      onAddUser?.(user);
    }
  };

  const handleClose = () => {
    setWorldwide(false);
    setSearchQuery('');
    setDisplayedUsers([]);
    setCurrentPage(1);
    setHasMore(false);
    setSearchError(null);
    setHasLoadedInitial(false);
    onClose();
  };

  const addedUsersCount = addedUserIds.length;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close dialog if clicking on the backdrop (not the dialog content)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">
            Add User from Database
          </h2>
          {addedUsersCount > 0 && (
            <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {addedUsersCount} {addedUsersCount === 1 ? 'user' : 'users'} added
            </div>
          )}
        </div>
        <div className="mb-6 border-b border-slate-200"></div>

        {/* Search Section */}
        <div className="mb-6 flex items-center gap-4">
          {/* Left: Worldwide Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="worldwide"
              checked={worldwide}
              onChange={(e) => setWorldwide(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="worldwide"
              className="text-sm font-medium text-slate-700 cursor-pointer"
            >
              Worldwide
            </label>
          </div>

          {/* Right: Search Box and Button */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-2"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div ref={scrollContainerRef} className="mb-6 max-h-96 overflow-y-auto">
          {searchError ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <p className="text-sm">{searchError}</p>
            </div>
          ) : displayedUsers.length === 0 && !isSearching ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <p className="text-sm">No users found. Try searching.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {displayedUsers.map((user) => {
                  const isAdded = addedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 rounded border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      {/* User Image */}
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100">
                        {user.image || user.imageUrl ? (
                          <img
                            src={user.image || user.imageUrl}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      {/* User Name */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        {user.username && (
                          <p className="text-xs text-slate-500">
                            @{user.username}
                          </p>
                        )}
                      </div>

                      {/* Add/Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleAddRemove(user)}
                        className={`rounded px-4 py-2 text-sm font-medium text-white transition ${
                          isAdded
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {isAdded ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-slate-500">
                    Loading more users...
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded bg-slate-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
