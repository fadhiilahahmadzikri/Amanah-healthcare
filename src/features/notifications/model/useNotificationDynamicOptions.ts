'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import type { ClinicNotification } from '../types';
import type { NotificationCategoryFilter, NotificationStatusFilter } from './notificationFilters';

export const NOTIFICATION_CATEGORY_OPTIONS = [
  { value: 'Janji Temu', label: 'Janji Temu' },
  { value: 'Shift & Kehadiran', label: 'Shift & Kehadiran' },
  { value: 'Promo', label: 'Promo Klinik' },
  { value: 'Hasil Lab', label: 'Hasil Lab' },
  { value: 'Antrean', label: 'Nomor Antrean' },
  { value: 'Farmasi', label: 'Farmasi & Obat' },
  { value: 'Telemedisin', label: 'Telemedisin' },
  { value: 'Chat Pasien', label: 'Chat Pasien' }
] as const;

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: 'unread', label: 'Belum Dibaca', dotColor: 'bg-primary' },
  { value: 'read', label: 'Sudah Dibaca', dotColor: 'bg-muted-foreground/60' }
] as const;

export interface UseNotificationDynamicOptionsProps {
  notifications: ClinicNotification[];
  categoryFilter: NotificationCategoryFilter;
  statusFilter: NotificationStatusFilter;
  searchQuery: string;
  actions: {
    changeSearch: (value: string) => void;
    changeCategoryFilter: (value: string) => void;
    changeStatusFilter: (value: string) => void;
  };
}

export function useNotificationDynamicOptions({
  notifications,
  categoryFilter,
  statusFilter,
  searchQuery,
  actions
}: UseNotificationDynamicOptionsProps) {
  // 1. Dynamic Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  const statusCounts = useMemo(() => {
    let unread = 0;
    let read = 0;
    notifications.forEach((item) => {
      if (item.status === 'unread') unread++;
      else if (item.status === 'read') read++;
    });
    return { unread, read };
  }, [notifications]);

  // 2. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    return [
      {
        id: 'category',
        title: 'Kategori',
        icon: Icons.filter,
        mode: 'single',
        options: NOTIFICATION_CATEGORY_OPTIONS.map((cat) => ({
          label: cat.label,
          value: cat.value,
          count: categoryCounts[cat.value] || 0
        })),
        selectedValues: categoryFilter !== 'ALL' ? [categoryFilter] : [],
        onSelect: (val: string) => {
          actions.changeCategoryFilter(categoryFilter === val ? 'ALL' : val);
        },
        onReset: () => actions.changeCategoryFilter('ALL'),
        resetLabel: 'Semua Kategori',
        popoverWidth: 'w-52'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'single',
        options: NOTIFICATION_STATUS_OPTIONS.map((st) => ({
          label: st.label,
          value: st.value,
          dotColor: st.dotColor,
          count: st.value === 'unread' ? statusCounts.unread : statusCounts.read
        })),
        selectedValues: statusFilter !== 'ALL' ? [statusFilter] : [],
        onSelect: (val: string) => {
          actions.changeStatusFilter(statusFilter === val ? 'ALL' : val);
        },
        onReset: () => actions.changeStatusFilter('ALL'),
        resetLabel: 'Semua Status',
        popoverWidth: 'w-48'
      }
    ];
  }, [categoryCounts, categoryFilter, statusCounts, statusFilter, actions]);

  // 3. Accurate Active Filter Count for Trigger Badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (categoryFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    return count;
  }, [searchQuery, categoryFilter, statusFilter]);

  // 4. Centralized Search Engine Index Items
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const seen = new Set<string>();
    const items: SearchEngineResultItem[] = [];

    notifications.forEach((n) => {
      if (n.sender && !seen.has(n.sender)) {
        seen.add(n.sender);
        items.push({
          id: `sender-${n.id}`,
          title: n.sender,
          subtitle: n.roleSubtitle,
          category: 'Pengirim',
          icon: Icons.user,
          queryValue: n.sender
        });
      }

      if (n.title && !seen.has(n.title)) {
        seen.add(n.title);
        items.push({
          id: `title-${n.id}`,
          title: n.title,
          subtitle: n.category,
          category: 'Judul Notifikasi',
          icon: Icons.notification,
          queryValue: n.title
        });
      }
    });

    return items;
  }, [notifications]);

  const searchEngine = useStateSearchEngine({
    query: searchQuery,
    onQueryChange: actions.changeSearch,
    id: 'notifications-search',
    title: 'Pencarian Notifikasi',
    description: 'Cari berdasarkan pengirim atau judul notifikasi',
    placeholder: 'Ketik kata kunci...',
    indexItems
  });

  return {
    facetGroups,
    activeFilterCount,
    searchEngine
  };
}
