'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApiService } from '../api/notification-api-service';
import { mapBackendToClinicNotification } from '../utils/notification-mapper';
import { useNotificationStore } from '../utils/store';
import type {
  ClinicNotification,
  ClinicNotificationCategory,
  ClinicNotificationStatus
} from '../types';
import {
  filterNotifications,
  getIsAllSelected,
  getIsFiltered,
  paginateNotifications,
  togglePageSelection,
  toggleSelection,
  type NotificationCategoryFilter,
  type NotificationStatusFilter,
  type NotificationViewStyle
} from './notificationFilters';

interface UseNotificationsPageResult {
  notifications: ClinicNotification[];
  paginatedList: ClinicNotification[];
  selectedIds: Set<string>;
  categoryFilter: NotificationCategoryFilter;
  statusFilter: NotificationStatusFilter;
  searchQuery: string;
  viewStyle: NotificationViewStyle;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isFiltered: boolean;
  isAllSelected: boolean;
  isCategoryOpen: boolean;
  isStatusOpen: boolean;
  bulkBarRef: RefObject<HTMLDivElement | null>;
  actions: {
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    bulkMarkAsRead: () => number;
    bulkDelete: () => number;
    toggleSelect: (id: string) => void;
    toggleSelectAll: () => void;
    clearSelection: () => void;
    resetAllFilters: () => void;
    changeSearch: (value: string) => void;
    changeCategoryFilter: (value: string) => void;
    changeStatusFilter: (value: string) => void;
    changeViewStyle: (value: NotificationViewStyle) => void;
    changePage: (page: number) => void;
    changePageSize: (pageSize: number) => void;
    setCategoryOpen: (isOpen: boolean) => void;
    setStatusOpen: (isOpen: boolean) => void;
  };
}

export function useNotificationsPage(): UseNotificationsPageResult {
  const queryClient = useQueryClient();
  const {
    notifications,
    setNotifications,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    bulkMarkAsRead: storeBulkMarkAsRead,
    bulkDelete
  } = useNotificationStore();

  const listQuery = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: () => notificationApiService.getMyNotifications({ limit: 100 }),
    staleTime: 10_000
  });

  useEffect(() => {
    if (listQuery.data?.data) {
      const mapped = listQuery.data.data.map(mapBackendToClinicNotification);
      setNotifications(mapped);
    }
  }, [listQuery.data?.data, setNotifications]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategoryFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<NotificationViewStyle>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const bulkBarRef = useRef<HTMLDivElement>(null);
  const filters = useMemo(
    () => ({ categoryFilter, statusFilter, searchQuery }),
    [categoryFilter, statusFilter, searchQuery]
  );
  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, filters),
    [notifications, filters]
  );
  const paginatedList = useMemo(
    () => paginateNotifications(filteredNotifications, currentPage, pageSize),
    [filteredNotifications, currentPage, pageSize]
  );
  const isAllSelected = getIsAllSelected(paginatedList, selectedIds);

  useEffect(() => {
    const bulkBar = bulkBarRef.current;
    if (!bulkBar) return;

    if (selectedIds.size > 0) {
      gsap.to(bulkBar, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', display: 'flex' });
      return;
    }

    gsap.to(bulkBar, {
      y: 80,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        bulkBar.style.display = 'none';
      }
    });
  }, [selectedIds.size]);

  const clearSelection = () => setSelectedIds(new Set());
  const consumeSelectedIds = (action: (ids: string[]) => void) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return 0;

    action(ids);
    clearSelection();
    return ids.length;
  };

  const handleMarkAsRead = async (id: string) => {
    storeMarkAsRead(id);
    try {
      await notificationApiService.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  const handleMarkAllAsRead = async () => {
    storeMarkAllAsRead();
    try {
      await notificationApiService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  return {
    notifications,
    paginatedList,
    selectedIds,
    categoryFilter,
    statusFilter,
    searchQuery,
    viewStyle,
    currentPage,
    pageSize,
    totalItems: filteredNotifications.length,
    isFiltered: getIsFiltered(filters),
    isAllSelected,
    isCategoryOpen,
    isStatusOpen,
    bulkBarRef,
    actions: {
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      bulkMarkAsRead: () => consumeSelectedIds(storeBulkMarkAsRead),
      bulkDelete: () => consumeSelectedIds(bulkDelete),
      toggleSelect: (id) => setSelectedIds((prev) => toggleSelection(prev, id)),
      toggleSelectAll: () =>
        setSelectedIds((prev) => togglePageSelection(prev, paginatedList, isAllSelected)),
      clearSelection,
      resetAllFilters: () => {
        setSearchQuery('');
        setCategoryFilter('ALL');
        setStatusFilter('ALL');
        setCurrentPage(1);
      },
      changeSearch: (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
      },
      changeCategoryFilter: (value) => {
        setCategoryFilter(value as ClinicNotificationCategory | 'ALL');
        setIsCategoryOpen(false);
        setCurrentPage(1);
      },
      changeStatusFilter: (value) => {
        setStatusFilter(value as ClinicNotificationStatus | 'ALL');
        setIsStatusOpen(false);
        setCurrentPage(1);
      },
      changeViewStyle: setViewStyle,
      changePage: setCurrentPage,
      changePageSize: setPageSize,
      setCategoryOpen: setIsCategoryOpen,
      setStatusOpen: setIsStatusOpen
    }
  };
}
