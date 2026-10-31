'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { backupDriversQueryOptions, userInfiniteQueryOptions } from '../api/queries';
import type { DriverMetadata, UserFilters, UserItem } from '../api/types';

export interface UserTableMeta {
  onViewDetail?: (user: UserItem) => void;
  onEdit?: (user: UserItem) => void;
  onToggleStatus?: (user: UserItem, nextStatus: string) => void;
  onPurge?: (user: UserItem) => void;
}

interface UseUserTableParams {
  columns: ColumnDef<UserItem>[];
  columnIds: string[];
}

export interface UseUserTableResult {
  table: Table<UserItem>;
  activeUsers: UserItem[];
  selectedUser: UserItem | null;
  selectedUsers: UserItem[];
  availableDrivers: DriverMetadata[];
  isDetailOpen: boolean;
  isEditingDetail: boolean;
  isPurgeOpen: boolean;
  isBulkPurgeOpen: boolean;
  isExportOpen: boolean;
  isRestoreOpen: boolean;
  isLoading: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalUsers: number;
  hasActiveFilters: boolean;
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  audienceFilter: string;
  handleSearchChange: (value: string) => void;
  handleRoleChange: (roleId: string) => void;
  handleStatusChange: (status: string) => void;
  handleAudienceChange: (audience: string) => void;
  resetFilters: () => void;
  actions: {
    openDetail: (user: UserItem) => void;
    openEdit: (user: UserItem) => void;
    closeDetail: () => void;
    openPurge: (user: UserItem) => void;
    closePurge: () => void;
    openBulkPurge: (users?: UserItem[]) => void;
    closeBulkPurge: () => void;
    openExport: () => void;
    closeExport: () => void;
    openRestore: () => void;
    closeRestore: () => void;
  };
}

export function useUserTable({ columns, columnIds }: UseUserTableParams): UseUserTableResult {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([]);
  const [activeDialog, setActiveDialog] = useState<
    'detail' | 'edit' | 'purge' | 'bulkPurge' | 'export' | 'restore' | null
  >(null);

  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(''),
    role: parseAsString.withDefault(''),
    status: parseAsString.withDefault(''),
    audience: parseAsString.withDefault(''),
    sort: getSortingStateParser<UserItem>(columnIds).withDefault([])
  });

  const querySearch = params.search ?? '';
  const queryRole = params.role ?? '';
  const queryStatus = params.status ?? '';
  const queryAudience = params.audience ?? '';
  const querySort =
    params.sort && params.sort.length > 0
      ? `${params.sort[0].id}:${params.sort[0].desc ? 'desc' : 'asc'}`
      : undefined;

  const hasActiveFilters = Boolean(querySearch || queryRole || queryStatus || queryAudience);

  const filters: UserFilters = useMemo(
    () => ({
      limit: 25,
      ...(querySearch && { search: querySearch }),
      ...(queryRole && { roleId: queryRole }),
      ...(queryStatus && { status: queryStatus }),
      ...(queryAudience && { audience: queryAudience }),
      ...(querySort && { sort: querySort })
    }),
    [querySearch, queryRole, queryStatus, queryAudience, querySort]
  );

  const infiniteQuery = useInfiniteQuery(userInfiniteQueryOptions(filters));
  const driversQuery = useQuery(backupDriversQueryOptions());

  const activeUsers = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((page) => page.users || []);
  }, [infiniteQuery.data?.pages]);

  const totalUsers = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.total ?? activeUsers.length;
  }, [infiniteQuery.data?.pages, activeUsers.length]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target?.isIntersecting &&
        infiniteQuery.hasNextPage &&
        !infiniteQuery.isFetchingNextPage
      ) {
        void infiniteQuery.fetchNextPage();
      }
    },
    [infiniteQuery]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !infiniteQuery.hasNextPage) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
      threshold: 0.1
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, infiniteQuery.hasNextPage]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return activeUsers.find((u) => u.id === selectedUserId) ?? null;
  }, [activeUsers, selectedUserId]);

  const openDetail = (u: UserItem) => {
    setSelectedUserId(u.id);
    setActiveDialog('detail');
  };

  const openEdit = (u: UserItem) => {
    setSelectedUserId(u.id);
    setActiveDialog('edit');
  };

  const closeDetail = () => {
    setActiveDialog(null);
  };

  const openPurge = (u: UserItem) => {
    setSelectedUserId(u.id);
    setActiveDialog('purge');
  };

  const closePurge = () => {
    setActiveDialog(null);
  };

  const openBulkPurge = (userList?: UserItem[]) => {
    if (userList && userList.length > 0) {
      setSelectedUsers(userList);
    }
    setActiveDialog('bulkPurge');
  };

  const closeBulkPurge = () => {
    setActiveDialog(null);
  };

  const openExport = () => setActiveDialog('export');
  const closeExport = () => setActiveDialog(null);

  const openRestore = () => setActiveDialog('restore');
  const closeRestore = () => setActiveDialog(null);

  const meta: UserTableMeta = {
    onViewDetail: openDetail,
    onEdit: openEdit,
    onPurge: openPurge
  };

  const { table } = useDataTable({
    data: activeUsers,
    columns,
    pageCount: -1,
    shallow: true,
    debounceMs: 300,
    meta,
    manualFiltering: true,
    manualSorting: false,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  const handleSearchChange = useCallback(
    (value: string) => {
      setParams({ search: value || null });
    },
    [setParams]
  );

  const handleRoleChange = useCallback(
    (roleId: string) => {
      setParams({ role: roleId === 'all' || !roleId ? null : roleId });
    },
    [setParams]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setParams({ status: status === 'all' || !status ? null : status });
    },
    [setParams]
  );

  const handleAudienceChange = useCallback(
    (audience: string) => {
      setParams({ audience: audience === 'all' || !audience ? null : audience });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    setParams({
      search: null,
      role: null,
      status: null,
      audience: null,
      sort: []
    });
  }, [setParams]);

  return {
    table,
    activeUsers,
    selectedUser,
    selectedUsers,
    availableDrivers: driversQuery.data || [],
    isDetailOpen: activeDialog === 'detail' || activeDialog === 'edit',
    isEditingDetail: activeDialog === 'edit',
    isPurgeOpen: activeDialog === 'purge',
    isBulkPurgeOpen: activeDialog === 'bulkPurge',
    isExportOpen: activeDialog === 'export',
    isRestoreOpen: activeDialog === 'restore',
    isLoading: infiniteQuery.isLoading,
    sentinelRef,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: Boolean(infiniteQuery.hasNextPage),
    totalUsers,
    hasActiveFilters,
    searchQuery: querySearch,
    roleFilter: queryRole,
    statusFilter: queryStatus,
    audienceFilter: queryAudience,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handleAudienceChange,
    resetFilters,
    actions: {
      openDetail,
      openEdit,
      closeDetail,
      openPurge,
      closePurge,
      openBulkPurge,
      closeBulkPurge,
      openExport,
      closeExport,
      openRestore,
      closeRestore
    }
  };
}
