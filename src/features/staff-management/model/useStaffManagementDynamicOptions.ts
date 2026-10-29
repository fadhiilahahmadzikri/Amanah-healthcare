'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { toggleItem } from '@/shared/lib/array/toggle-item';
import type { FacetGroupDefinition } from '@/shared/ui/responsive-facet-toolbox';
import { useStateSearchEngine, type SearchEngineResultItem } from '@/components/search-engine';
import { polyclinicsQueryOptions } from '../api/queries';
import {
  STAFF_ROLE_KANBAN_COLUMNS,
  STAFF_OPERATIONAL_STATUS_CONFIG,
  STAFF_OPERATIONAL_STATUS
} from '../constants/staff.constants';
import type { useStaffManagementView } from './useStaffManagementView';

export interface UseStaffManagementDynamicOptionsProps {
  view: ReturnType<typeof useStaffManagementView>;
}

export function useStaffManagementDynamicOptions({ view }: UseStaffManagementDynamicOptionsProps) {
  const { data: polyclinics = [] } = useQuery(polyclinicsQueryOptions());

  // 1. Facet Groups for ResponsiveFacetToolbox & Mobile FacetSidebarSheet
  const facetGroups = useMemo<FacetGroupDefinition[]>(() => {
    // Role / Staff Type options
    const roleOptions = STAFF_ROLE_KANBAN_COLUMNS.map((col) => {
      const count = view.allStaffs.filter((s) => s.staffType === col.id).length;
      return {
        label: col.title,
        value: col.id,
        count,
        dotColor: col.dotColor
      };
    });

    // Operational Status options
    const statusOptions = (
      [
        STAFF_OPERATIONAL_STATUS.ACTIVE,
        STAFF_OPERATIONAL_STATUS.PENDING,
        STAFF_OPERATIONAL_STATUS.ON_LEAVE,
        STAFF_OPERATIONAL_STATUS.INACTIVE
      ] as const
    ).map((st) => {
      const cfg = STAFF_OPERATIONAL_STATUS_CONFIG[st];
      const count = view.allStaffs.filter((s) => s.status === st).length;
      return {
        label: cfg.label,
        value: st,
        count,
        dotColor: cfg.dotColor
      };
    });

    // Poliklinik options from dynamic database catalog
    const poliOptions = polyclinics.map((p) => {
      const count = view.allStaffs.filter(
        (s) => s.poliklinikId === p.id || s.poliklinikName === p.name
      ).length;
      return {
        label: p.name,
        value: p.id,
        count
      };
    });

    const groups: FacetGroupDefinition[] = [
      {
        id: 'role',
        title: 'Peran',
        icon: Icons.users,
        mode: 'multi',
        options: roleOptions,
        selectedValues: view.selectedRoles,
        onSelect: (role: string) => {
          view.actions.changeSelectedRoles(toggleItem(view.selectedRoles, role));
        },
        onReset: () => view.actions.changeSelectedRoles([]),
        popoverWidth: 'w-48',
        resetLabel: 'Semua Peran'
      },
      {
        id: 'status',
        title: 'Status',
        icon: Icons.activity,
        mode: 'multi',
        options: statusOptions,
        selectedValues: view.selectedStatuses,
        onSelect: (st: string) => {
          view.actions.changeSelectedStatuses(toggleItem(view.selectedStatuses, st));
        },
        onReset: () => view.actions.changeSelectedStatuses([]),
        popoverWidth: 'w-52',
        resetLabel: 'Semua Status'
      }
    ];

    if (poliOptions.length > 0) {
      groups.push({
        id: 'poli',
        title: 'Poliklinik',
        icon: Icons.plusCircle,
        mode: 'multi',
        options: poliOptions,
        selectedValues: view.selectedPoli,
        onSelect: (poli: string) => {
          view.actions.changeSelectedPoli(toggleItem(view.selectedPoli, poli));
        },
        onReset: () => view.actions.changeSelectedPoli([]),
        popoverWidth: 'w-56',
        resetLabel: 'Semua Poli'
      });
    }

    return groups;
  }, [
    polyclinics,
    view.allStaffs,
    view.selectedRoles,
    view.selectedStatuses,
    view.selectedPoli,
    view.actions
  ]);

  // 2. Accurate count of active filter parameters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (view.searchQuery?.trim()) count++;
    if (view.selectedRoles.length > 0) count += view.selectedRoles.length;
    if (view.selectedStatuses.length > 0) count += view.selectedStatuses.length;
    if (view.selectedPoli.length > 0) count += view.selectedPoli.length;
    return count;
  }, [view.searchQuery, view.selectedRoles, view.selectedStatuses, view.selectedPoli]);

  // 3. Centralized Search Engine Index Items (Staff members + Units)
  const indexItems = useMemo<SearchEngineResultItem[]>(() => {
    const items: SearchEngineResultItem[] = [];

    view.allStaffs.forEach((staff) => {
      items.push({
        id: `staff-${staff.id}`,
        title: staff.fullName,
        subtitle: `${staff.profession || 'Staf'} • ${staff.email || staff.staffCode || ''}`,
        category: 'Staf',
        icon: Icons.users,
        queryValue: staff.fullName
      });
    });

    polyclinics.forEach((p, idx) => {
      items.push({
        id: `poli-${idx}-${p.id}`,
        title: p.name,
        subtitle: 'Unit Poliklinik',
        category: 'Poliklinik',
        icon: Icons.mapPin,
        queryValue: p.name
      });
    });

    return items;
  }, [view.allStaffs, polyclinics]);

  const searchEngine = useStateSearchEngine({
    query: view.searchQuery,
    onQueryChange: view.actions.changeSearch,
    id: 'staff-management-search',
    placeholder: 'Cari nama staf, peran, email, atau poliklinik...',
    indexItems
  });

  return {
    facetGroups,
    activeFilterCount,
    searchEngine
  };
}
