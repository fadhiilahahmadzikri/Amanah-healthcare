'use client';

import { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { REPLACEMENT_STATUS_CONFIG, SESSION_CODE_LABELS } from '../constants/replacement.constants';
import type { ReplacementOpportunityItem } from '../api/types';
import type { UseReplacementFiltersResult } from './useReplacementFilters';

export const REPLACEMENT_STATUS_OPTIONS = [
  { value: 'open', label: REPLACEMENT_STATUS_CONFIG.open.label, dotColor: 'bg-amber-500' },
  { value: 'claimed', label: REPLACEMENT_STATUS_CONFIG.claimed.label, dotColor: 'bg-emerald-500' },
  { value: 'completed', label: REPLACEMENT_STATUS_CONFIG.completed.label, dotColor: 'bg-blue-500' },
  { value: 'cancelled', label: REPLACEMENT_STATUS_CONFIG.cancelled.label, dotColor: 'bg-rose-500' }
] as const;

export const REPLACEMENT_SESSION_OPTIONS = Object.entries(SESSION_CODE_LABELS).map(
  ([value, label]) => ({
    value,
    label
  })
);

export interface UseReplacementDynamicOptionsProps {
  filters: UseReplacementFiltersResult;
  opportunities: ReplacementOpportunityItem[];
}

export function useReplacementDynamicOptions({
  filters,
  opportunities
}: UseReplacementDynamicOptionsProps) {
  // 1. Facet Groups for Agnostic ResponsiveFacetToolbox & FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    return [
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'multi',
        options: REPLACEMENT_STATUS_OPTIONS.map((st) => ({
          label: st.label,
          value: st.value,
          dotColor: st.dotColor,
          count: filters.counts[st.value as keyof typeof filters.counts]
        })),
        selectedValues: filters.statusFilter,
        onSelect: (val: string) => {
          filters.actions.changeStatusFilter(toggleItem(filters.statusFilter, val));
        },
        onReset: () => filters.actions.changeStatusFilter([]),
        resetLabel: 'Reset Status',
        popoverWidth: 'w-48'
      },
      {
        id: 'session',
        title: 'Sesi Dinas',
        icon: Icons.clock,
        mode: 'multi',
        options: REPLACEMENT_SESSION_OPTIONS,
        selectedValues: filters.sessionFilter,
        onSelect: (val: string) => {
          filters.actions.changeSessionFilter(toggleItem(filters.sessionFilter, val));
        },
        onReset: () => filters.actions.changeSessionFilter([]),
        resetLabel: 'Reset Sesi',
        popoverWidth: 'w-48'
      }
    ];
  }, [filters.counts, filters.statusFilter, filters.sessionFilter, filters.actions]);

  // 2. Accurate Active Filter Count for Trigger Badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery?.trim()) count++;
    if (filters.statusFilter.length > 0) count += filters.statusFilter.length;
    if (filters.sessionFilter.length > 0) count += filters.sessionFilter.length;
    return count;
  }, [filters.searchQuery, filters.statusFilter, filters.sessionFilter]);

  // 3. Centralized Search Engine Index Items (Original staff & Claimed staff)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const seen = new Set<string>();
    const items: SearchEngineResultItem[] = [];

    opportunities.forEach((o) => {
      const origName = o.originalStaffName;
      if (origName && !seen.has(origName)) {
        seen.add(origName);
        items.push({
          id: `orig-${o.id}`,
          title: origName,
          subtitle: `${o.originalStaffRole || 'Staf Cuti'}`,
          category: 'Staf Cuti',
          icon: Icons.user,
          queryValue: origName
        });
      }

      const claimedName = o.claimedByName;
      if (claimedName && !seen.has(claimedName)) {
        seen.add(claimedName);
        items.push({
          id: `claimed-${o.id}`,
          title: claimedName,
          subtitle: `${o.claimedByRole || 'Staf Pengganti'}`,
          category: 'Pengganti',
          icon: Icons.userCheck,
          queryValue: claimedName
        });
      }
    });

    return items;
  }, [opportunities]);

  const searchEngine = useStateSearchEngine({
    query: filters.searchQuery,
    onQueryChange: filters.actions.changeSearch,
    id: 'peluang-pengganti-search',
    title: 'Pencarian Peluang Pengganti',
    description: 'Cari berdasarkan nama staf cuti atau staf pengganti',
    placeholder: 'Ketik nama staf...',
    indexItems
  });

  return {
    facetGroups,
    activeFilterCount,
    searchEngine
  };
}
